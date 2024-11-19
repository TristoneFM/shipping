'use client'

import SideBar from '../sidebar/SideBar';
import CaptureContent from './CaptureContent';
import AuthLayout from '../auth/AuthLayout';

export default function Capture() {

return(
    <AuthLayout>
        <SideBar>
            <CaptureContent/>
        </SideBar>
    </AuthLayout>
)
}