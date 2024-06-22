import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/router';

const NewPost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('diary');
  const router = useRouter();

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD形式の日付
    const frontMatter = `---
title: '${title}'
date: '${date}'
description: ''
image: 'seed-default.png'
categories: ['${category}']
---

${content}`;

    const formData = new FormData();
    const blob = new Blob([frontMatter], { type: 'text/markdown' });
    const file = new File([blob], `${title.replace(/[^a-zA-Z0-9]/g, '_')}.md`);
    formData.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      alert('Article uploaded successfully');
      router.push('/'); // 投稿後にホームページへリダイレクト
    } else {
      alert('Failed to upload article');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="title">Title:</label>
        <input type="text" id="title" value={title} onChange={handleTitleChange} required />
      </div>
      <div>
        <label htmlFor="content">Content:</label>
        <textarea id="content" value={content} onChange={handleContentChange} required />
      </div>
      <div>
        <label htmlFor="category">Category:</label>
        <select id="category" value={category} onChange={handleCategoryChange}>
          <option value="diary">Diary</option>
        </select>
      </div>
      <button type="submit">Post Article</button>
    </form>
  );
};

export default NewPost;
