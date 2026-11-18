import { Link, useLocation } from "react-router";
import { LogoMark } from "~/components/Logo";

const Navbar = () => {
    const location = useLocation();

    const navLinks = [
        { href: "/", label: "Features" },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-[var(--color-border-light)]">
            <div className="container mx-auto px-4 md:px-8">
                <div className="flex items-center justify-between h-16 md:h-18">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 text-[var(--color-brand-700)] hover:text-[var(--color-brand-600)] transition-colors" aria-label="ResuScore Home">
                        <LogoMark className="h-9 w-9" />
                        <span className="font-display font-black uppercase tracking-[0.14em] text-lg md:text-xl">ResuScore</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                to={link.href}
                                className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors relative py-1"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        {/* Mobile menu button */}
                        <button
                            className="md:hidden p-2 rounded-lg hover:bg-[var(--color-neutral-100)] transition-colors"
                            aria-label="Open menu"
                            aria-expanded="false"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
                            </svg>
                        </button>

                        {/* CTA Button */}
                        <Link to="/upload" className="btn-primary btn-sm hidden md:block">
                            Scan Resume
                        </Link>
                        <Link to="/upload" className="btn-primary btn-sm md:hidden">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;