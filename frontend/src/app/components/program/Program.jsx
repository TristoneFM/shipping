'use client'

import SideBar from '../sidebar/SideBar';
import ProgramContent from './ProgramContent';
import AuthLayout from '../auth/AuthLayout';

export default function Dashboard() {

return(
    <AuthLayout>
        <SideBar>
            <ProgramContent/>
        </SideBar>
    </AuthLayout>
)
}