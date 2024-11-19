'use client'

import SideBar from '../sidebar/SideBar';
import DashboardContent from './DashboardContent';
import AuthLayout from '../auth/AuthLayout';

export default function Dashboard() {

return(
    <AuthLayout>
        <SideBar>
            <DashboardContent/>
        </SideBar>
    </AuthLayout>
)
}