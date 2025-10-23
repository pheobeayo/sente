import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle, Send } from 'lucide-react';
import { FaXTwitter } from "react-icons/fa6";
import { FaGithub } from "react-icons/fa6";
import logo from '@/public/logo.png';

export default function Footer() {
  const productLinks = [
    { name: 'Swap', href: '/swap' },
    { name: 'Pools', href: '/pool' },
    { name: 'Vote', href: '/vote' },
    { name: 'Charts', href: '/charts' }
  ];

  const resourceLinks = [
    { name: 'Documentation', href: '/docs' },
    { name: 'GitHub', href: '#' },
    { name: 'Whitepaper', href: '#' },
    { name: 'Audits', href: '#' }
  ];

  const communityLinks = [
    { name: 'Discord', href: '#', icon: <MessageCircle className="w-4 h-4" /> },
    { name: 'Twitter', href: '#', icon: <FaXTwitter  className="w-4 h-4" /> },
    { name: 'Telegram', href: '#', icon: <Send className="w-4 h-4" /> },
    { name: 'GitHub', href: '#', icon: <FaGithub className="w-4 h-4" /> }
  ];

  const legalLinks = [
    { name: 'Terms of Service', href: '#' },
    { name: 'Privacy Policy', href: '#' },
    { name: 'Cookie Policy', href: '#' }
  ];

  return (
    <footer className="bg-slate-900/80 backdrop-blur-lg border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3">
            <div className="flex items-center justify-center">
              <Image src={logo} alt="" width={90} height={90} />
              </div>
          </Link>
            <p className="text-gray-400 mb-6 max-w-sm">
              The most efficient decentralized exchange on Stacks. Trade, earn, and build on the leading community-driven DEX.
            </p>
            <div className="flex gap-4">
              {communityLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all"
                  aria-label={link.name}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-bold mb-4">Product</h3>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-bold mb-4">Resources</h3>
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-bold mb-4">Legal</h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">
            © 2025 Sente. All rights reserved.
          </p>
          
        </div>
      </div>
    </footer>
  );
}