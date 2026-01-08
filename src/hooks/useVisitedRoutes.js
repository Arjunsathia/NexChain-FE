
import { useContext } from 'react';
import { VisitedRoutesContext } from '../context/VisitedRoutesContext';

export const useVisitedRoutes = () => {
    const context = useContext(VisitedRoutesContext);
    if (!context) {
        throw new Error('useVisitedRoutes must be used within a VisitedRoutesProvider');
    }
    return context;
};
