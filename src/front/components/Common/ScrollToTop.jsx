import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// This component scrolls to the top of the page on every route change.
// Place it inside <Router> so it has access to the location context.

const ScrollToTop = ({ children }) => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return children;
};

export default ScrollToTop;