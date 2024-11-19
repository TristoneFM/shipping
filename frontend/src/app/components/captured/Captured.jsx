'use client'

import SideBar from '../sidebar/SideBar';
import CapturedContent from './CapturedContent';
import AuthLayout from '../auth/AuthLayout';


export default function Captured() {

return(
    <AuthLayout>
        <SideBar>
            <CapturedContent/>
        </SideBar>
    </AuthLayout>
)
}