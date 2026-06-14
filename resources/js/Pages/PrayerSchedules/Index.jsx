import { Calendar, Clock, MapPin, Moon, Search, Sun, SunDim, Sunrise, Sunset } from 'lucide-react';
import { useEffect, useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';

export default function Index({ profile }) {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // 1-indexed

    // Selected city state
    const [city, setCity] = useState(() => {
        const savedId = localStorage.getItem('masjid_prayer_city_id');
        const savedName = localStorage.getItem('masjid_prayer_city_name');
        if (savedId && savedName) {
            return { id: savedId, lokasi: savedName };
        }
        return null;
    });

    // Date filters
    const [month, setMonth] = useState(currentMonth);
    const [year, setYear] = useState(currentYear);

    // API Data state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Active & Next prayer calculation states
    const [activePrayer, setActivePrayer] = useState('');
    const [nextPrayer, setNextPrayer] = useState({ name: '', time: '', countdown: '' });

    // Initial search for default city based on profile
    useEffect(() => {
        if (!city) {
            const defaultQuery = profile?.city || 'Jakarta';
            setLoading(true);
            fetch(`https://api.myquran.com/v2/sholat/kota/cari/${encodeURIComponent(defaultQuery)}`)
                .then((res) => res.json())
                .then((res) => {
                    if (res.status && res.data && res.data.length > 0) {
                        const defaultCity = res.data[0];
                        setCity(defaultCity);
                        localStorage.setItem('masjid_prayer_city_id', defaultCity.id);
                        localStorage.setItem('masjid_prayer_city_name', defaultCity.lokasi);
                    } else {
                        // Hard fallback if no results
                        const fallbackCity = { id: '1301', lokasi: 'DKI JAKARTA' };
                        setCity(fallbackCity);
                        localStorage.setItem('masjid_prayer_city_id', fallbackCity.id);
                        localStorage.setItem('masjid_prayer_city_name', fallbackCity.lokasi);
                    }
                })
                .catch(() => {
                    const fallbackCity = { id: '1301', lokasi: 'DKI JAKARTA' };
                    setCity(fallbackCity);
                })
                .finally(() => setLoading(false));
        }
    }, [profile, city]);

    // Fetch schedule when city or date changes
    useEffect(() => {
        if (!city) return;

        setLoading(true);
        setError(null);

        fetch(`https://api.myquran.com/v2/sholat/jadwal/${city.id}/${year}/${month}`)
            .then((res) => res.json())
            .then((res) => {
                if (res.status && res.data) {
                    setSchedule(res.data);
                } else {
                    setError('Gagal memuat jadwal dari API. Pastikan parameter bulan/tahun sesuai.');
                }
            })
            .catch(() => {
                setError('Terjadi kesalahan koneksi saat memuat jadwal sholat.');
            })
            .finally(() => setLoading(false));
    }, [city, month, year]);

    // Search city handler
    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setSearching(true);
        fetch(`https://api.myquran.com/v2/sholat/kota/cari/${encodeURIComponent(searchQuery)}`)
            .then((res) => res.json())
            .then((res) => {
                if (res.status && res.data) {
                    setSearchResults(res.data);
                } else {
                    setSearchResults([]);
                }
            })
            .catch(() => {
                alert('Gagal mencari kota. Harap periksa koneksi internet Anda.');
            })
            .finally(() => setSearching(false));
    };

    // Select city handler
    const selectCity = (selected) => {
        setCity(selected);
        localStorage.setItem('masjid_prayer_city_id', selected.id);
        localStorage.setItem('masjid_prayer_city_name', selected.lokasi);
        setSearchQuery('');
        setSearchResults([]);
    };

    // Current time calculations for live countdown
    useEffect(() => {
        if (!schedule || !schedule.jadwal) return;

        // Find today's timings
        const todayStr = today.getDate().toString().padStart(2, '0');
        const todaySchedule = schedule.jadwal.find((day) => day.tanggal.startsWith(todayStr));

        if (!todaySchedule) return;

        const prayerKeys = {
            imsak: 'Imsak',
            subuh: 'Subuh',
            terbit: 'Terbit',
            dhuha: 'Dhuha',
            dzuhur: 'Dzuhur',
            ashar: 'Ashar',
            maghrib: 'Maghrib',
            isya: 'Isya',
        };

        const updateCountdowns = () => {
            const now = new Date();
            const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

            let nextPrayerName = '';
            let nextPrayerTime = '';
            let minDiff = Infinity;
            let currentActive = 'Isya'; // default fallback

            // Times parsed into minutes since midnight
            const currentMin = now.getHours() * 60 + now.getMinutes();

            const parsedTimes = [];

            Object.entries(prayerKeys).forEach(([key, name]) => {
                const timeVal = todaySchedule[key];
                if (timeVal) {
                    const [h, m] = timeVal.split(':').map(Number);
                    const prayerMin = h * 60 + m;
                    parsedTimes.push({ name, time: timeVal, min: prayerMin });
                }
            });

            // Sort prayer times by day progression
            parsedTimes.sort((a, b) => a.min - b.min);

            // Determine active and next prayer
            for (let i = 0; i < parsedTimes.length; i++) {
                const p = parsedTimes[i];
                if (currentMin >= p.min) {
                    currentActive = p.name;
                }

                const diff = p.min - currentMin;
                if (diff > 0 && diff < minDiff) {
                    minDiff = diff;
                    nextPrayerName = p.name;
                    nextPrayerTime = p.time;
                }
            }

            // If no next prayer is found today, it means next is Subuh tomorrow
            if (!nextPrayerName && parsedTimes.length > 0) {
                const firstPrayer = parsedTimes.find((p) => p.name === 'Subuh') || parsedTimes[0];
                nextPrayerName = firstPrayer.name;
                nextPrayerTime = firstPrayer.time;
                minDiff = (24 * 60 - currentMin) + firstPrayer.min;
            }

            // Calculate countdown string
            const cdHours = Math.floor(minDiff / 60);
            const cdMins = minDiff % 60;
            const cdSecs = 59 - now.getSeconds();

            let countdownStr = '';
            if (cdHours > 0) countdownStr += `${cdHours}j `;
            countdownStr += `${cdMins}m ${cdSecs}d`;

            setActivePrayer(currentActive);
            setNextPrayer({
                name: nextPrayerName,
                time: nextPrayerTime,
                countdown: countdownStr,
            });
        };

        updateCountdowns();
        const interval = setInterval(updateCountdowns, 1000);
        return () => clearInterval(interval);
    }, [schedule]);

    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const prayerIcons = {
        'Imsak': Sunrise,
        'Subuh': Sunrise,
        'Terbit': Sunrise,
        'Dhuha': Sun,
        'Dzuhur': Sun,
        'Ashar': SunDim,
        'Maghrib': Sunset,
        'Isya': Moon,
    };

    // Get today's details if loaded
    const todayStr = today.getDate().toString().padStart(2, '0');
    const todayData = schedule?.jadwal?.find((day) => day.tanggal.startsWith(todayStr));

    return (
        <AppLayout title="Jadwal Sholat Indonesia">
            <div className="min-w-0 space-y-5">
                {/* Header Widget */}
                <div className="flex min-w-0 flex-col gap-4 rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-900 p-4 text-white shadow-md sm:flex-row sm:items-center sm:justify-between lg:p-6">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="shrink-0 rounded-xl bg-white/10 p-3 backdrop-blur-md">
                            <Clock className="h-6 w-6 text-amber-200" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-100/70">Waktu Ibadah</span>
                            <h2 className="truncate text-base font-black tracking-tight sm:text-lg lg:text-xl">
                                Jadwal Sholat Kemenag RI
                            </h2>
                            <p className="mt-0.5 flex min-w-0 items-center gap-1 text-xs font-semibold text-emerald-50/80">
                                <MapPin className="h-3.5 w-3.5 shrink-0 text-amber-300" />
                                <span className="truncate">{city ? city.lokasi : 'Memuat lokasi...'}</span>
                            </p>
                        </div>
                    </div>

                    {nextPrayer.name && (
                        <div className="rounded-xl bg-white/10 px-4 py-3 text-left backdrop-blur-md sm:min-w-[180px] sm:text-right">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-200">
                                Selanjutnya: {nextPrayer.name} ({nextPrayer.time})
                            </p>
                            <p className="mt-0.5 font-mono text-lg font-black tracking-tight text-white animate-pulse">
                                - {nextPrayer.countdown}
                            </p>
                        </div>
                    )}
                </div>

                <div className="grid min-w-0 gap-5 lg:grid-cols-3">
                    {/* Left Panel: Search & City Info */}
                    <div className="min-w-0 space-y-4 lg:col-span-1">
                        {/* Search Card */}
                        <div className="min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                                Ganti Wilayah / Kota
                            </h3>
                            <form onSubmit={handleSearch} className="relative mt-3">
                                <input
                                    type="text"
                                    placeholder="Cari Kota/Kabupaten..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-10 pl-4 text-xs font-semibold text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                                />
                                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600">
                                    <Search className="h-4 w-4" />
                                </button>
                            </form>

                            {searching && (
                                <p className="mt-3 text-center text-xs font-bold text-slate-500">Mencari kota...</p>
                            )}

                            {searchResults.length > 0 && (
                                <div className="mt-3 max-h-48 space-y-1 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-1.5">
                                    {searchResults.map((res) => (
                                        <button
                                            key={res.id}
                                            type="button"
                                            onClick={() => selectCity(res)}
                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-bold text-slate-700 hover:bg-emerald-600 hover:text-white transition"
                                        >
                                            <MapPin className="h-3.5 w-3.5 shrink-0 opacity-70" />
                                            <span className="truncate">{res.lokasi}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {searchResults.length === 0 && searchQuery && !searching && (
                                <p className="mt-3 text-center text-[10px] font-bold text-slate-400">Tekan Enter untuk mencari</p>
                            )}
                        </div>

                        {/* Calendar Quick Filter */}
                        <div className="min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                                Pilih Periode Jadwal
                            </h3>
                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-500">Bulan</label>
                                    <select
                                        value={month}
                                        onChange={(e) => setMonth(Number(e.target.value))}
                                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white"
                                    >
                                        {months.map((m, idx) => (
                                            <option key={m} value={idx + 1}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-500">Tahun</label>
                                    <select
                                        value={year}
                                        onChange={(e) => setYear(Number(e.target.value))}
                                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white"
                                    >
                                        {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map((y) => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Daily Cards & Monthly Table */}
                    <div className="min-w-0 space-y-4 lg:col-span-2">
                        {/* Daily Timings Cards */}
                        <div className="min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
                            <h3 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-800">
                                <Calendar className="h-4 w-4 text-emerald-600" />
                                Hari Ini • {today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </h3>

                            {loading && !todayData ? (
                                <p className="mt-6 text-center text-xs font-bold text-slate-500">Memuat waktu sholat...</p>
                            ) : todayData ? (
                                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                                    {['subuh', 'terbit', 'dzuhur', 'ashar', 'maghrib', 'isya'].map((key) => {
                                        const pName = key === 'dzuhur' ? 'Dzuhur' : key === 'ashar' ? 'Ashar' : key === 'maghrib' ? 'Maghrib' : key === 'isya' ? 'Isya' : key.charAt(0).toUpperCase() + key.slice(1);
                                        const Icon = prayerIcons[pName] || Sun;
                                        const timeVal = todayData[key];
                                        const isAct = activePrayer === pName;
                                        const isNext = nextPrayer.name === pName;

                                        return (
                                            <div
                                                key={key}
                                                className={`relative rounded-xl p-4 transition-all duration-200 ${
                                                    isAct
                                                        ? 'bg-emerald-50 border-2 border-emerald-500 shadow-sm shadow-emerald-100'
                                                        : isNext
                                                        ? 'bg-amber-50/50 border-2 border-dashed border-amber-300'
                                                        : 'bg-slate-50/50 border border-slate-100 hover:bg-slate-50'
                                                }`}
                                            >
                                                {isAct && (
                                                    <span className="absolute -top-2.5 left-3 rounded-full bg-emerald-600 px-2 py-0.5 text-[8px] font-black uppercase text-white">
                                                        Sedang Berlangsung
                                                    </span>
                                                )}
                                                {isNext && !isAct && (
                                                    <span className="absolute -top-2.5 left-3 rounded-full bg-amber-500 px-2 py-0.5 text-[8px] font-black uppercase text-white">
                                                        Berikutnya
                                                    </span>
                                                )}
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">{pName}</span>
                                                    <Icon className={`h-4 w-4 ${isAct ? 'text-emerald-600' : isNext ? 'text-amber-500' : 'text-slate-400'}`} />
                                                </div>
                                                <p className={`mt-2 font-mono text-lg font-black tracking-tight ${isAct ? 'text-emerald-700' : isNext ? 'text-amber-700' : 'text-slate-800'}`}>
                                                    {timeVal}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="mt-6 text-center text-xs font-semibold text-slate-500">Jadwal hari ini tidak tersedia untuk bulan yang dipilih.</p>
                            )}
                        </div>

                        {/* Monthly Schedule Table */}
                        <div className="min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                                Jadwal Bulanan • {months[month - 1]} {year}
                            </h3>

                            {error && (
                                <div className="mt-4 rounded-xl bg-rose-50 p-4 text-center text-xs font-bold text-rose-700">
                                    {error}
                                </div>
                            )}

                            {loading ? (
                                <p className="mt-8 text-center text-xs font-bold text-slate-500">Memuat tabel jadwal...</p>
                            ) : schedule?.jadwal ? (
                                <>
                                    <div className="mt-4 space-y-2 sm:hidden">
                                        {schedule.jadwal.map((day) => {
                                            const dayNum = parseInt(day.tanggal.split(',')[0]);
                                            const isToday = dayNum === today.getDate() && month === currentMonth && year === currentYear;

                                            return (
                                                <div
                                                    key={day.tanggal}
                                                    className={`rounded-xl border p-3 ${
                                                        isToday ? 'border-emerald-200 bg-emerald-50/70 text-emerald-950' : 'border-slate-100 bg-white text-slate-800'
                                                    }`}
                                                >
                                                    <p className="text-xs font-extrabold text-slate-900">{day.tanggal}</p>
                                                    <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] font-bold">
                                                        <TimePill label="Subuh" value={day.subuh} />
                                                        <TimePill label="Dzuhur" value={day.dzuhur} />
                                                        <TimePill label="Ashar" value={day.ashar} />
                                                        <TimePill label="Maghrib" value={day.maghrib} />
                                                        <TimePill label="Isya" value={day.isya} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-4 hidden overflow-x-auto rounded-xl border border-slate-100 sm:block">
                                    <table className="w-full text-left text-xs text-slate-700">
                                        <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-100">
                                            <tr>
                                                <th className="px-4 py-3">Tanggal</th>
                                                <th className="px-3 py-3">Subuh</th>
                                                <th className="px-3 py-3">Dzuhur</th>
                                                <th className="px-3 py-3">Ashar</th>
                                                <th className="px-3 py-3">Maghrib</th>
                                                <th className="px-3 py-3">Isya</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 font-medium">
                                            {schedule.jadwal.map((day) => {
                                                const dayNum = parseInt(day.tanggal.split(',')[0]);
                                                const isToday = dayNum === today.getDate() && month === currentMonth && year === currentYear;

                                                return (
                                                    <tr
                                                        key={day.tanggal}
                                                        className={`hover:bg-slate-50/80 transition-colors ${
                                                            isToday ? 'bg-emerald-50/50 font-bold text-emerald-950' : ''
                                                        }`}
                                                    >
                                                        <td className="px-4 py-2.5 text-slate-900">
                                                            {day.tanggal}
                                                        </td>
                                                        <td className="px-3 py-2.5 font-mono">{day.subuh}</td>
                                                        <td className="px-3 py-2.5 font-mono">{day.dzuhur}</td>
                                                        <td className="px-3 py-2.5 font-mono">{day.ashar}</td>
                                                        <td className="px-3 py-2.5 font-mono">{day.maghrib}</td>
                                                        <td className="px-3 py-2.5 font-mono">{day.isya}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                    </div>
                                </>
                            ) : (
                                <p className="mt-8 text-center text-xs font-semibold text-slate-500">Pilih wilayah untuk memuat jadwal.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function TimePill({ label, value }) {
    return (
        <div className="rounded-lg bg-slate-50 px-2 py-1.5">
            <p className="text-[9px] font-black uppercase tracking-wide text-slate-400">{label}</p>
            <p className="font-mono text-xs font-black text-slate-800">{value}</p>
        </div>
    );
}
