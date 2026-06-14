import { router, useForm, usePage } from '@inertiajs/react';
import { Edit3, Phone, Plus, ShieldCheck, Trash2, UserRound, X } from 'lucide-react';
import { CheckboxInput, Field, PrimaryButton, SecondaryButton, SelectInput, TextInput } from '../../Components/FormControls';
import AppLayout from '../../Layouts/AppLayout';
import { date, label } from '../../lib/formatters';

const emptyForm = {
    name: '',
    email: '',
    whatsapp_number: '',
    role: 'takmir',
    use_custom_permissions: false,
    custom_permissions: [],
    password: '',
    password_confirmation: '',
};

export default function Index({ users, roles, rolePermissions, permissionOptions }) {
    const { auth } = usePage().props;
    const { data, setData, post, put, processing, errors, reset } = useForm(emptyForm);
    const editingId = data.id || null;

    const submit = (event) => {
        event.preventDefault();
        editingId ? put(`/users/${editingId}`, { onSuccess: () => resetForm() }) : post('/users', { onSuccess: () => resetForm() });
    };

    const edit = (user) => {
        setData({
            id: user.id,
            name: user.name,
            email: user.email,
            whatsapp_number: user.whatsapp_number || '',
            role: user.role,
            use_custom_permissions: Array.isArray(user.custom_permissions),
            custom_permissions: user.custom_permissions || rolePermissions[user.role] || [],
            password: '',
            password_confirmation: '',
        });
    };

    const resetForm = () => {
        reset();
        setData(emptyForm);
    };

    const toggleCustomPermissions = (enabled) => {
        setData({
            ...data,
            use_custom_permissions: enabled,
            custom_permissions: enabled ? data.custom_permissions.length > 0 ? data.custom_permissions : rolePermissions[data.role] || [] : [],
        });
    };

    const togglePermission = (permission, checked) => {
        const permissions = checked
            ? [...new Set([...data.custom_permissions, permission])]
            : data.custom_permissions.filter((item) => item !== permission);

        setData('custom_permissions', permissions);
    };

    const destroy = (user) => {
        if (user.id === auth?.user?.id) {
            window.alert('Akun yang sedang digunakan tidak dapat dihapus.');
            return;
        }

        if (window.confirm(`Hapus user ${user.name}?`)) {
            router.delete(`/users/${user.id}`);
        }
    };

    return (
        <AppLayout title="User Manajemen">
            <div className="grid min-w-0 gap-4 xl:grid-cols-[0.8fr_1.2fr]">
                <form onSubmit={submit} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center gap-2.5">
                        <div className="rounded-lg bg-teal-100 p-2 text-teal-700">
                            <ShieldCheck className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">
                                {editingId ? 'Ubah User' : 'Tambah User'}
                            </p>
                            <h3 className="text-sm font-extrabold text-slate-950">Role & Hak Akses</h3>
                        </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        <TextInput label="Nama" value={data.name} onChange={(event) => setData('name', event.target.value)} error={errors.name} />
                        <TextInput label="Email" type="email" value={data.email} onChange={(event) => setData('email', event.target.value)} error={errors.email} />
                        <div className="md:col-span-2">
                            <TextInput
                                label="Nomor WA"
                                value={data.whatsapp_number}
                                onChange={(event) => setData('whatsapp_number', event.target.value)}
                                error={errors.whatsapp_number}
                                placeholder="Contoh: 6281234567890"
                            />
                        </div>
                        <TextInput
                            label={editingId ? 'Password Baru' : 'Password'}
                            type="password"
                            value={data.password}
                            onChange={(event) => setData('password', event.target.value)}
                            error={errors.password}
                            placeholder={editingId ? 'Kosongkan jika tidak diganti' : ''}
                        />
                        <TextInput
                            label="Konfirmasi Password"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(event) => setData('password_confirmation', event.target.value)}
                            error={errors.password_confirmation}
                        />
                        <SelectInput label="Role" value={data.role} onChange={(event) => setData('role', event.target.value)} error={errors.role}>
                            {roles.map((role) => (
                                <option key={role} value={role}>
                                    {label(role)}
                                </option>
                            ))}
                        </SelectInput>
                        <Field label="Hak Akses">
                            <div className="mt-1 min-h-[34px] rounded-lg border border-teal-100 bg-teal-50/70 p-2 text-[10px] font-semibold leading-5 text-teal-800">
                                {(rolePermissions[data.role] || []).map((permission) => label(permission)).join(', ') || '-'}
                            </div>
                        </Field>
                        <div className="md:col-span-2">
                            <CheckboxInput
                                label="Gunakan hak akses custom untuk user ini"
                                checked={Boolean(data.use_custom_permissions)}
                                onChange={toggleCustomPermissions}
                            />
                        </div>
                        {data.use_custom_permissions && (
                            <div className="md:col-span-2 rounded-xl border border-teal-100 bg-teal-50/60 p-3">
                                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700">Pilih Hak Akses Custom</p>
                                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                                    {permissionOptions.map((permission) => (
                                        <CheckboxInput
                                            key={permission}
                                            label={label(permission)}
                                            checked={data.custom_permissions.includes(permission)}
                                            onChange={(checked) => togglePermission(permission, checked)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <PrimaryButton disabled={processing} className="gap-2">
                            <Plus className="h-4 w-4" />
                            {editingId ? 'Simpan User' : 'Tambah User'}
                        </PrimaryButton>
                        {editingId && (
                            <SecondaryButton type="button" onClick={resetForm} className="gap-2">
                                <X className="h-4 w-4" />
                                Batal
                            </SecondaryButton>
                        )}
                    </div>
                </form>

                <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-950">Daftar User</h3>
                    <div className="mt-3 space-y-2">
                        {users.map((user) => (
                            <article key={user.id} className="rounded-xl border border-slate-100 bg-white p-3 shadow-xs">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700">
                                            {user.avatar_path ? (
                                                <img src={`/storage/${user.avatar_path}`} alt={user.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <UserRound className="h-5 w-5" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-extrabold text-slate-900">{user.name}</p>
                                            <p className="truncate text-[11px] font-semibold text-slate-500">{user.email}</p>
                                            {user.whatsapp_number && (
                                                <p className="mt-0.5 flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                                                    <Phone className="h-3 w-3" />
                                                    {user.whatsapp_number}
                                                </p>
                                            )}
                                            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-teal-700">
                                                {label(user.role)} {Array.isArray(user.custom_permissions) ? '• Custom akses' : ''} • Bergabung {date(user.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 gap-2">
                                        <button className="rounded-lg bg-emerald-50 p-2 text-emerald-700" type="button" onClick={() => edit(user)}>
                                            <Edit3 className="h-4 w-4" />
                                        </button>
                                        <button
                                            className="rounded-lg bg-rose-50 p-2 text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                                            type="button"
                                            onClick={() => destroy(user)}
                                            disabled={user.id === auth?.user?.id}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                        {users.length === 0 && <p className="rounded-xl border border-dashed border-teal-200 bg-teal-50/60 p-4 text-center text-xs font-semibold text-slate-500">Belum ada user.</p>}
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
