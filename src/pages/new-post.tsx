import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/router";
import "../styles/new-post.css";

const NewPost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("diary");
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

  const saveMdFile = async (publicationType: string) => {
    const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD形式の日付
    const frontMatter = `---
title: '${title}'
date: '${date}'
description: ''
image: 'seed-default.png'
categories: ['${category}']
publications: ['${publicationType}']
---

${content}`;

    const formData = new FormData();
    const blob = new Blob([frontMatter], { type: "text/markdown" });
    const file = new File([blob], `${title.replace(/[^a-zA-Z0-9]/g, "_")}.md`);
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      if (publicationType === "public") {
        alert("Article uploaded successfully");
        router.push("/"); // 投稿後にホームページへリダイレクト
      } else if (publicationType == "draft") {
        alert("Draft saved successfully");
      } else {
        alert("Something went wrong!");
      }
    } else {
      alert("Failed to process the request");
    }
  };

  const handleUpload = async (e: FormEvent<HTMLFormElement>) => {
    //submit時のdefault動作(現在のURLに内容を送信)
    e.preventDefault();
    saveMdFile("public");
  };

  const handleSaveDraft = async () => {
    saveMdFile("draft");
  };

  return (
    <div className="container">
      <form className="form" onSubmit={handleUpload}>
        <div>
          <label className="label" htmlFor="title">
            Title:
          </label>
          <input
            className="input"
            type="text"
            id="title"
            value={title}
            onChange={handleTitleChange}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="content">
            Content:
          </label>
          <textarea
            className="textarea"
            id="content"
            value={content}
            onChange={handleContentChange}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="category">
            Category:
          </label>
          <select
            className="select"
            id="category"
            value={category}
            onChange={handleCategoryChange}
          >
            <option value="diary">Diary</option>
          </select>
        </div>
        <button className="button" type="button" onClick={handleSaveDraft}>
          Save Draft
        </button>
        <button className="button" type="submit">
          Post Article
        </button>
      </form>
    </div>
  );
};

export default NewPost;
