import { useEffect } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';

const legacyTabRedirects: Record<string, string> = {
    dashboard: '/admin/dashboard',
    control: '/admin/dashboard',
    revenue: '/admin/billing',
    companies: '/admin/companies',
    users: '/admin/companies',
    notifications: '/admin/communications',
    messaging: '/admin/communications',
    leads: '/admin/leads',
    plans: '/admin/plans',
    addons: '/admin/addons',
    roles: '/admin/security',
    audit: '/admin/audit',
    reports: '/admin/dashboard',
    settings: '/admin/settings',
};

const AdminIndexPage: NextPage = () => {
    const router = useRouter();

    useEffect(() => {
        if (!router.isReady) return;

        const tab = typeof router.query.tab === 'string' ? router.query.tab : 'dashboard';
        const target = legacyTabRedirects[tab] || '/admin/dashboard';

        void router.replace(target);
    }, [router.isReady, router.query.tab, router]);

    return <div style={{ padding: 24 }}>Redirecting to admin dashboard...</div>;
};

export default AdminIndexPage;
