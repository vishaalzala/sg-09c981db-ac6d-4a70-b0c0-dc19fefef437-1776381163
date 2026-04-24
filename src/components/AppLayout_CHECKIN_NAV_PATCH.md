# AppLayout Check-In Nav Patch

Do not blindly overwrite `src/components/AppLayout.tsx`.

Find the Check-In nav item. If it currently links to:

```tsx
href: "/checkin"
```

change it to build with companyId:

```tsx
href: companyId ? `/checkin?companyId=${companyId}` : "/dashboard/settings"
```

If your navigation items are rendered from an array, use:

```tsx
{
  name: "Check-In",
  href: companyId ? `/checkin?companyId=${companyId}` : "/dashboard/settings",
  icon: ClipboardCheck,
}
```

This prevents the kiosk page from showing "Workshop not found" when opened from inside the company app.
