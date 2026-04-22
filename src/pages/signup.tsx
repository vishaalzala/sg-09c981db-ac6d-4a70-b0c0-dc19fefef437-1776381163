import { useState } from "react";
import { useRouter } from "next/router";
import { signUp } from "@/services/authService";

export default function SignupPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        companyName: "",
        phone: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const validateForm = () => {
        if (!form.fullName.trim()) {
            setError("Full name is required.");
            return false;
        }

        if (!form.email.trim()) {
            setError("Email is required.");
            return false;
        }

        if (!form.password) {
            setError("Password is required.");
            return false;
        }

        if (form.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return false;
        }

        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (loading) return;

        setError("");
        setSuccess("");

        if (!validateForm()) return;

        setLoading(true);

        try {
            const result = await signUp({
                fullName: form.fullName,
                email: form.email,
                password: form.password,
                companyName: form.companyName,
                phone: form.phone,
            });

            if (result.error) {
                setError(result.error.message);
                return;
            }

            if (result.requiresEmailConfirmation) {
                setSuccess(
                    "Account created successfully. Please confirm your email, then sign in to continue."
                );
                return;
            }

            setSuccess("Account created successfully. Redirecting...");
            router.push("/onboarding/company");
        } catch (err: any) {
            console.error("Signup page error:", err);
            setError(err?.message || "Signup failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h1 style={styles.title}>Create your account</h1>
                <p style={styles.subtitle}>
                    Sign up to start your free trial and set up your company.
                </p>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <input
                        type="text"
                        name="fullName"
                        placeholder="Full name"
                        value={form.fullName}
                        onChange={handleChange}
                        style={styles.input}
                        required
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email address"
                        value={form.email}
                        onChange={handleChange}
                        style={styles.input}
                        required
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        style={styles.input}
                        required
                    />

                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm password"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        style={styles.input}
                        required
                    />

                    <input
                        type="text"
                        name="companyName"
                        placeholder="Company name (optional here, can finish in onboarding)"
                        value={form.companyName}
                        onChange={handleChange}
                        style={styles.input}
                    />

                    <input
                        type="text"
                        name="phone"
                        placeholder="Phone number (optional)"
                        value={form.phone}
                        onChange={handleChange}
                        style={styles.input}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...styles.button,
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? "not-allowed" : "pointer",
                        }}
                    >
                        {loading ? "Creating account..." : "Sign up"}
                    </button>

                    {error ? <p style={styles.error}>{error}</p> : null}
                    {success ? <p style={styles.success}>{success}</p> : null}
                </form>

                <div style={styles.footer}>
                    Already have an account?{" "}
                    <a href="/login" style={styles.link}>
                        Log in
                    </a>
                </div>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    page: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "#f8fafc",
    },
    card: {
        width: "100%",
        maxWidth: "460px",
        background: "#ffffff",
        borderRadius: "16px",
        padding: "32px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    },
    title: {
        margin: 0,
        marginBottom: "8px",
        fontSize: "28px",
        fontWeight: 700,
        color: "#0f172a",
    },
    subtitle: {
        marginTop: 0,
        marginBottom: "24px",
        color: "#475569",
        fontSize: "14px",
        lineHeight: 1.5,
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "14px",
    },
    input: {
        width: "100%",
        padding: "12px 14px",
        borderRadius: "10px",
        border: "1px solid #cbd5e1",
        fontSize: "14px",
        outline: "none",
    },
    button: {
        marginTop: "6px",
        padding: "12px 16px",
        borderRadius: "10px",
        border: "none",
        background: "#2563eb",
        color: "#ffffff",
        fontSize: "15px",
        fontWeight: 600,
    },
    error: {
        margin: 0,
        color: "#dc2626",
        fontSize: "14px",
    },
    success: {
        margin: 0,
        color: "#16a34a",
        fontSize: "14px",
    },
    footer: {
        marginTop: "20px",
        fontSize: "14px",
        color: "#475569",
        textAlign: "center",
    },
    link: {
        color: "#2563eb",
        textDecoration: "none",
        fontWeight: 600,
    },
};