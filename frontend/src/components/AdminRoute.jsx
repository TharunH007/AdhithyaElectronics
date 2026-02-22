import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const AdminRoute = () => {
    const { userInfo } = useAuthStore();

    return userInfo && userInfo.isAdmin ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export default AdminRoute;
