import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/router";
import "../styles/new-post.css";
import MarkDownEditor from "@/components/markdown-editor";

const NewPost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("diary");
  const [drafts, setDrafts] = useState([
    {
      title: "My First Draft",
      thumbnail: "https://via.placeholder.com/150",
      content: "This is the content of my first draft.",
      category: "diary",
    },
    {
      title: "Travel Notes",
      thumbnail: "https://via.placeholder.com/150",
      content: "Travel notes content goes here.",
      category: "travel",
    },
  ]); // サンプル下書きデータ

  const router = useRouter();

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleContentChange = (value: string) => {
    setContent(value);
  };

  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
  };

  const handleDraftSelect = (draft: typeof drafts[0]) => {
    setTitle(draft.title);
    setContent(draft.content);
    setCategory(draft.category);
  };

  const saveMdFile = async (publicationType: string) => {
    const date = new Date().toISOString().slice(0, 10);
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
        router.push("/");
      } else if (publicationType === "draft") {
        alert("Draft saved successfully");
      } else {
        alert("Something went wrong!");
      }
    } else {
      alert("Failed to process the request");
    }
  };

  const handleUpload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    saveMdFile("public");
  };

  const handleSaveDraft = async () => {
    saveMdFile("draft");
  };

  return (
    <div className="container flex">
  {/* 左側の入力エリア */}
  <div className="w-2/3 pr-4">
    <form className="form bg-white p-6 rounded shadow" onSubmit={handleUpload}>
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
        <MarkDownEditor
          value={content}
          onChange={(value) => handleContentChange(value)}
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

  <div className="w-1/3 pl-4">
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Draft</h2>
      <div className="space-y-4">
        {drafts.map((draft, index) => (
          <div
            key={index}
            className="border p-4 flex items-center cursor-pointer hover:bg-gray-100"
            onClick={() => handleDraftSelect(draft)}
          >
            <img
              src={draft.thumbnail}
              alt={draft.title}
              className="w-16 h-16 mr-4"
            />
            <div>
              <h3 className="text-lg font-semibold">{draft.title}</h3>
              <p className="text-sm text-gray-600">{draft.category}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</div>

  );
};

export default NewPost;


// import { useState, ChangeEvent, FormEvent } from "react";
// import { useRouter } from "next/router";
// import "../styles/new-post.css";
// import MarkDownEditor from "@/components/markdown-editor";

// const NewPost = () => {
//   const [title, setTitle] = useState("");
//   const [content, setContent] = useState("");
//   const [category, setCategory] = useState("diary");
//   const router = useRouter();

//   const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
//     setTitle(e.target.value);
//   };

//   const handleContentChange = (value: string) => {
//     setContent(value);
//   };

//   const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
//     setCategory(e.target.value);
//   };

//   const saveMdFile = async (publicationType: string) => {
//     const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD形式の日付
//     const frontMatter = `---
// title: '${title}'
// date: '${date}'
// description: ''
// image: 'seed-default.png'
// categories: ['${category}']
// publications: ['${publicationType}']
// ---

// ${content}`;

//     const formData = new FormData();
//     const blob = new Blob([frontMatter], { type: "text/markdown" });
//     const file = new File([blob], `${title.replace(/[^a-zA-Z0-9]/g, "_")}.md`);
//     formData.append("file", file);

//     const res = await fetch("/api/upload", {
//       method: "POST",
//       body: formData,
//     });

//     if (res.ok) {
//       if (publicationType === "public") {
//         alert("Article uploaded successfully");
//         router.push("/"); // 投稿後にホームページへリダイレクト
//       } else if (publicationType == "draft") {
//         alert("Draft saved successfully");
//       } else {
//         alert("Something went wrong!");
//       }
//     } else {
//       alert("Failed to process the request");
//     }
//   };

//   const handleUpload = async (e: FormEvent<HTMLFormElement>) => {
//     //submit時のdefault動作(現在のURLに内容を送信)
//     e.preventDefault();
//     saveMdFile("public");
//   };

//   const handleSaveDraft = async () => {
//     saveMdFile("draft");
//   };

//   return (
//     <div className="container">
//       <form className="form" onSubmit={handleUpload}>
//         <div>
//           <label className="label" htmlFor="title">
//             Title:
//           </label>
//           <input
//             className="input"
//             type="text"
//             id="title"
//             value={title}
//             onChange={handleTitleChange}
//             required
//           />
//         </div>
//         <div>
//           <label className="label" htmlFor="content">
//             Content:
//           </label>
//           <MarkDownEditor
//             value={content}
//             onChange={(value) => handleContentChange(value)} // Markdownデータを更新
//           />
//         </div>
//         <div>
//           <label className="label" htmlFor="category">
//             Category:
//           </label>
//           <select
//             className="select"
//             id="category"
//             value={category}
//             onChange={handleCategoryChange}
//           >
//             <option value="diary">Diary</option>
//           </select>
//         </div>
//         <button className="button" type="button" onClick={handleSaveDraft}>
//           Save Draft
//         </button>
//         <button className="button" type="submit">
//           Post Article
//         </button>
//       </form>
//     </div>
//   );
// };

// export default NewPost;
