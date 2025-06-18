import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-black text-gray-400 text-sm py-6 mt-12 border-t border-gray-700">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p> Movie App.</p>
         <div className="mt-2">
          Made by Hoàng Trần Nam-2121050036
          <a
            href="https://github.com/your-github-username"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-white underline"
          >
            GitHub
          </a>
        </div>
       
      </div>
    </footer>
  );
};

export default Footer;
