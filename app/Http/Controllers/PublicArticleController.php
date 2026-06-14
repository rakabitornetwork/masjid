<?php

namespace App\Http\Controllers;

use App\Models\PublicArticle;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PublicArticleController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('PublicArticles/Index', [
            'articles' => PublicArticle::latest('published_at')->latest()->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validatedData($request);
        $data['slug'] = $this->uniqueSlug($data['slug'] ?: $data['title']);

        if ($data['status'] === 'published' && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        if ($request->hasFile('cover_image')) {
            $data['cover_image_path'] = $request->file('cover_image')->store('public-articles', 'public');
        }

        unset($data['cover_image']);

        PublicArticle::create($data);

        return back()->with('success', 'Artikel publik berhasil ditambahkan.');
    }

    public function update(Request $request, PublicArticle $article): RedirectResponse
    {
        $data = $this->validatedData($request, $article);
        $data['slug'] = $this->uniqueSlug($data['slug'] ?: $data['title'], $article);

        if ($data['status'] === 'published' && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        if ($request->hasFile('cover_image')) {
            if ($article->cover_image_path) {
                Storage::disk('public')->delete($article->cover_image_path);
            }

            $data['cover_image_path'] = $request->file('cover_image')->store('public-articles', 'public');
        }

        unset($data['cover_image']);

        $article->update($data);

        return back()->with('success', 'Artikel publik berhasil diperbarui.');
    }

    public function destroy(PublicArticle $article): RedirectResponse
    {
        if ($article->cover_image_path) {
            Storage::disk('public')->delete($article->cover_image_path);
        }

        $article->delete();

        return back()->with('success', 'Artikel publik berhasil dihapus.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedData(Request $request, ?PublicArticle $article = null): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('public_articles', 'slug')->ignore($article?->id)],
            'category' => ['nullable', 'string', 'max:100'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'body' => ['required', 'string'],
            'cover_image' => ['nullable', 'image', 'max:3072'],
            'published_at' => ['nullable', 'date'],
            'status' => ['required', 'in:draft,published,archived'],
            'is_featured' => ['boolean'],
        ]);
    }

    private function uniqueSlug(string $source, ?PublicArticle $article = null): string
    {
        $base = Str::slug($source) ?: Str::random(8);
        $slug = $base;
        $counter = 2;

        while (PublicArticle::where('slug', $slug)->when($article, fn ($query) => $query->whereKeyNot($article->id))->exists()) {
            $slug = "{$base}-{$counter}";
            $counter++;
        }

        return $slug;
    }
}
