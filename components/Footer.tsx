import Link from "next/link";
import {
  GraduationCap,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Clock,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-20 md:hidden lg:hidden">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand & Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="font-heading text-xl font-bold text-white">
                SchoolERP
              </span>
            </div>

            <p className="text-gray-400 mb-6 leading-relaxed">
              Comprehensive school management system designed to streamline
              administrative tasks, enhance communication, and improve
              educational outcomes for students, teachers, and parents.
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              <Link
                href="#"
                aria-label="Facebook"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-primary-600 flex items-center justify-center transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                aria-label="Twitter"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-primary-600 flex items-center justify-center transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                aria-label="LinkedIn"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-primary-600 flex items-center justify-center transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-primary-600 flex items-center justify-center transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </Link>
            </div>
          </div>


          {/* Resources */}
          <div>
            <h3 className="font-heading text-white font-bold mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-primary-400 transition-colors flex items-center gap-2"
                >
                  <ChevronRight className="w-4 h-4" />
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-primary-400 transition-colors flex items-center gap-2"
                >
                  <ChevronRight className="w-4 h-4" />
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-primary-400 transition-colors flex items-center gap-2"
                >
                  <ChevronRight className="w-4 h-4" />
                  Video Tutorials
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-primary-400 transition-colors flex items-center gap-2"
                >
                  <ChevronRight className="w-4 h-4" />
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-primary-400 transition-colors flex items-center gap-2"
                >
                  <ChevronRight className="w-4 h-4" />
                  System Status
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-heading text-white font-bold mb-4">
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary-400 shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">
                  123 Education Street, Lagos State, Nigeria
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary-400 shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">+234 800 123 4567</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary-400 shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">
                  support@schoolerp.com
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary-400 shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">
                  Mon - Fri: 8:00 AM - 5:00 PM
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © 2024 SchoolERP. All rights reserved.
            </p>

            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link
                href="#"
                className="text-gray-400 hover:text-primary-400 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-primary-400 transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-primary-400 transition-colors"
              >
                Cookie Policy
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-primary-400 transition-colors"
              >
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
