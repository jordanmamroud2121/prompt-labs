"use client";

import { useEffect, useRef } from 'react';
import { useState } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ 
  content,
  className = "" 
}: MarkdownRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // We're not using copyState in this simplified version, removed it

  // Basic Markdown formatting function
  const formatMarkdown = (text: string): string => {
    // Format headers
    text = text.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    text = text.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    text = text.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    
    // Format lists
    text = text.replace(/^\s*\* (.*$)/gm, '<li>$1</li>');
    text = text.replace(/^\s*- (.*$)/gm, '<li>$1</li>');
    text = text.replace(/^\s*\d+\. (.*$)/gm, '<li>$1</li>');
    
    // Format code blocks
    text = text.replace(/```([\s\S]*?)```/g, (match, code) => {
      // Identify language if specified
      const languageMatch = code.match(/^([a-zA-Z0-9]+)\n/);
      let language = '';
      let codeContent = code;
      
      if (languageMatch) {
        language = languageMatch[1];
        codeContent = code.substring(languageMatch[0].length);
      }
      
      return `<pre class="code-block" data-language="${language}"><code>${codeContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
    });
    
    // Format inline code
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Format bold and italic
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Format links
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Convert newlines to <br> or new paragraphs
    text = text.replace(/\n\n/g, '</p><p>');
    text = text.replace(/\n/g, '<br>');
    
    return `<p>${text}</p>`;
  };

  useEffect(() => {
    if (containerRef.current) {
      // Apply formatted markdown
      containerRef.current.innerHTML = formatMarkdown(content);
      
      // Add copy buttons to code blocks
      const codeBlocks = containerRef.current.querySelectorAll('pre.code-block');
      codeBlocks.forEach((block, index) => {
        const codeElement = block.querySelector('code');
        if (codeElement) {
          const blockId = `code-block-${index}`;
          block.id = blockId;
          
          const copyButton = document.createElement('button');
          copyButton.className = 'code-copy-button';
          copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
          copyButton.onclick = (e) => {
            e.preventDefault();
            navigator.clipboard.writeText(codeElement.textContent || '');
            
            // Add a visual indicator that copying worked
            copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
            
            // Reset after 2 seconds
            setTimeout(() => {
              copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
            }, 2000);
          };
          
          // Create a container for the language label if one exists
          const language = block.getAttribute('data-language');
          if (language && language.trim() !== '') {
            const langLabel = document.createElement('div');
            langLabel.className = 'code-language';
            langLabel.textContent = language;
            block.appendChild(langLabel);
          }
          
          block.appendChild(copyButton);
        }
      });
    }
  }, [content]);

  return (
    <div 
      ref={containerRef}
      className={`markdown-renderer prose prose-sm max-w-none dark:prose-invert ${className}`}
    />
  );
} 