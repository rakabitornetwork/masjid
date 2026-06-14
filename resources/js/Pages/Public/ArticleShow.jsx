import { Link } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, Newspaper } from 'lucide-react';
import PublicLayout from '../../Layouts/PublicLayout';
import { date, label } from '../../lib/formatters';

export default function ArticleShow({ profile, article, relatedArticles }) {
    return (
        <PublicLayout title={`${article.title} - ${profile?.name || 'Masjid'}`}>
            <article className="py-6">
                <Link href="/" className="inline-flex items-center gap-1.5 rounded-xl bg-white/80 px-3 py-2 text-xs font-extrabold text-teal-700 ring-1 ring-teal-100">
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke Beranda
                </Link>

                <div className="mt-4 overflow-hidden rounded-3xl border border-slate-100 bg-white/90 shadow-xl shadow-blue-950/10">
                    {article.cover_image_path && (
                        <img src={`/storage/${article.cover_image_path}`} alt={article.title} className="h-64 w-full object-cover" />
                    )}
                    <div className="p-5 lg:p-8">
                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-teal-700">
                            <Newspaper className="h-4 w-4" />
                            <span>{label(article.category)}</span>
                            <span>•</span>
                            <CalendarDays className="h-4 w-4" />
                            <span>{date(article.published_at)}</span>
                        </div>
                        <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950 lg:text-4xl">{article.title}</h1>
                        {article.excerpt && <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">{article.excerpt}</p>}
                        <div className="mt-6 whitespace-pre-line text-sm font-medium leading-7 text-slate-700">{article.body}</div>
                    </div>
                </div>
            </article>

            {relatedArticles.length > 0 && (
                <section className="pb-8">
                    <h2 className="text-xs font-black uppercase tracking-[0.14em] text-slate-950">Artikel Terkait</h2>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                        {relatedArticles.map((relatedArticle) => (
                            <Link key={relatedArticle.id} href={`/artikel/${relatedArticle.slug}`} className="rounded-2xl border border-slate-100 bg-white/85 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                                <p className="text-xs font-extrabold text-slate-950">{relatedArticle.title}</p>
                                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-teal-700">{date(relatedArticle.published_at)}</p>
                                <p className="mt-2 line-clamp-2 text-xs font-medium leading-5 text-slate-600">{relatedArticle.excerpt || relatedArticle.body}</p>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </PublicLayout>
    );
}
