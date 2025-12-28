import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="py-12 bg-white border-t border-gray-100">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                        Mother AI
                    </div>
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} Mother AI Systems. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-gray-500">
                        <a href="#" className="hover:text-purple-600 transition-colors">Twitter</a>
                        <a href="#" className="hover:text-purple-600 transition-colors">LinkedIn</a>
                        <a href="#" className="hover:text-purple-600 transition-colors">Instagram</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
