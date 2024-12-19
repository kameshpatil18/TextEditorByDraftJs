import React, { useState, useEffect } from 'react';
import { Editor, EditorState, RichUtils, Modifier, convertToRaw, convertFromRaw } from 'draft-js';
import 'draft-js/dist/Draft.css';
import '../Components/TextEditor.css';

const TextEditor = () => {
  const [editorState, setEditorState] = useState(() => {
    const savedContent = localStorage.getItem('editorContent');
    return savedContent
      ? EditorState.createWithContent(convertFromRaw(JSON.parse(savedContent)))
      : EditorState.createEmpty();
  });

  const handleKeyCommand = (command) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  const handleBeforeInput = (chars, editorState) => {
    const selection = editorState.getSelection();
    const currentContent = editorState.getCurrentContent();
    const blockKey = selection.getStartKey();
    const block = currentContent.getBlockForKey(blockKey);
    const blockText = block.getText();

    if (blockText === '' && chars === ' ') {
      if (block.getType() === 'unstyled') {
        return 'handled';
      }
    }

    if (blockText === '#' && chars === ' ') {
      const newContent = Modifier.replaceText(
        currentContent,
        selection.merge({ anchorOffset: 0, focusOffset: blockText.length + 1 }),
        ''
      );
      const newState = EditorState.push(editorState, newContent, 'remove-range');
      setEditorState(RichUtils.toggleBlockType(newState, 'header-one'));
      return 'handled';
    }

    if (blockText === '*' && chars === ' ') {
      const newContent = Modifier.replaceText(
        currentContent,
        selection.merge({ anchorOffset: 0, focusOffset: blockText.length + 1 }),
        ''
      );
      setEditorState(RichUtils.toggleInlineStyle(EditorState.push(editorState, newContent, 'remove-range'), 'BOLD'));
      return 'handled';
    }

    if (blockText === '**' && chars === ' ') {
      const newContent = Modifier.replaceText(
        currentContent,
        selection.merge({ anchorOffset: 0, focusOffset: blockText.length + 1 }),
        ''
      );
      const newState = EditorState.push(editorState, newContent, 'remove-range');
      setEditorState(RichUtils.toggleInlineStyle(newState, 'RED'));
      return 'handled';
    }

    if (blockText === '***' && chars === ' ') {
      const newContent = Modifier.replaceText(
        currentContent,
        selection.merge({ anchorOffset: 0, focusOffset: blockText.length + 1 }),
        ''
      );
      const newState = EditorState.push(editorState, newContent, 'remove-range');
      setEditorState(RichUtils.toggleInlineStyle(newState, 'UNDERLINE'));
      return 'handled';
    }

    return 'not-handled';
  };

  const saveContent = () => {
    const contentState = editorState.getCurrentContent();
    const rawContent = JSON.stringify(convertToRaw(contentState));
    localStorage.setItem('editorContent', rawContent);
    alert('Content saved!');
  };

  useEffect(() => {
    const savedContent = localStorage.getItem('editorContent');
    if (savedContent) {
      setEditorState(EditorState.createWithContent(convertFromRaw(JSON.parse(savedContent))));
    }
  }, []);

  return (
    <div className="text-editor-wrapper">
      <div className="editor-header">Demo editor by Kamesh Patil</div>
      <div className="editor-actions">
        <button onClick={saveContent}>Save</button>
      </div>
      <div className="editor-container">
        <Editor
          editorState={editorState}
          onChange={setEditorState}
          handleKeyCommand={handleKeyCommand}
          handleBeforeInput={(chars) => handleBeforeInput(chars, editorState)}
          customStyleMap={styleMap}
        />
      </div>
    </div>
  );
};

const styleMap = {
  BOLD: {
    fontWeight: 'bold',
  },
  RED: {
    color: 'red',
  },
  UNDERLINE: {
    textDecoration: 'underline',
  },
};

export default TextEditor;
