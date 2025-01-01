import React, { useState } from "react";
import 'easymde/dist/easymde.min.css';
import dynamic from "next/dynamic";

type MarkDownEditorProps = {
    value: string;
    onChange: (value: string) => void;
};

const SimpleMDE = dynamic(() => import("react-simplemde-editor"), { ssr: false });

const MarkDownEditor: React.FC<MarkDownEditorProps> = ({ value, onChange }) => {
    return <SimpleMDE value={value} onChange={onChange} />;
};
  
export default MarkDownEditor;
