import { Link } from "react-router";
import { usePuterStore } from "~/lib/puter";

const Navbar = () => {
    const { auth } = usePuterStore();

    return (
        <nav className="navbar">
            <Link to="/">
                <p className="text-2xl font-bold text-gradient">RESUMIND</p>
            </Link>
            <div className="flex items-center gap-4">
                <Link to="/upload" className="primary-button w-fit text-sm font-semibold whitespace-nowrap">
                    Upload Resume
                </Link>
                {auth.isAuthenticated ? (
                    <button
                        type="button"
                        onClick={auth.signOut}
                        className="text-sm font-semibold text-gray-600 hover:text-black cursor-pointer px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors whitespace-nowrap"
                    >
                        Log Out
                    </button>
                ) : (
                    <Link
                        to="/auth"
                        className="text-sm font-semibold text-gray-600 hover:text-black px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors whitespace-nowrap"
                    >
                        Log In
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
