import { useState, ChangeEvent, FormEvent } from 'react';

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if(e.target.files != null) setFile(e.target.files[0]);
  };

  const handleSubmit = async (e : FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file as Blob);

    //APIを呼ぶ
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      alert('File uploaded successfully');
    } else {
      alert('File upload failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" accept=".md" onChange={handleFileChange} />
      <button type="submit">Upload</button>
    </form>
  );
};

export default Upload;
