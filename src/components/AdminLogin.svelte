<script lang="ts">
    import { loginAdmin } from '~/utils/admin-auth';

    export let isOpen = false;
    export let onSuccess: () => void;

    let password = '';
    let error = '';
    let isLoading = false;

    async function handleLogin() {
        if (!password.trim()) {
            error = '请输入密码';
            return;
        }

        isLoading = true;
        error = '';

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));

        if (loginAdmin(password)) {
            onSuccess();
            closeModal();
        } else {
            error = '密码错误，请重试';
            password = '';
        }

        isLoading = false;
    }

    function closeModal() {
        isOpen = false;
        password = '';
        error = '';
        isLoading = false;
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            closeModal();
        }
    }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
    <div class="login-overlay" on:click={closeModal}>
        <div class="login-modal" on:click|stopPropagation>
            <div class="login-header">
                <h2>管理员登录</h2>
                <button class="close-btn" on:click={closeModal}>×</button>
            </div>

            <div class="login-content">
                <p class="login-description">请输入管理员密码以访问分析数据</p>

                <form on:submit|preventDefault={handleLogin}>
                    <div class="form-group">
                        <label for="password">密码</label>
                        <input
                            id="password"
                            type="password"
                            bind:value={password}
                            placeholder="请输入管理员密码"
                            disabled={isLoading}
                            autofocus
                        />
                    </div>

                    {#if error}
                        <div class="error-message">{error}</div>
                    {/if}

                    <div class="form-actions">
                        <button
                            type="button"
                            class="btn-secondary"
                            on:click={closeModal}
                            disabled={isLoading}
                        >
                            取消
                        </button>
                        <button
                            type="submit"
                            class="btn-primary"
                            disabled={isLoading || !password.trim()}
                        >
                            {isLoading ? '登录中...' : '登录'}
                        </button>
                    </div>
                </form>

                <div class="login-note">
                    <small>
                        💡 默认密码: admin123<br>
                        生产环境请设置环境变量 VITE_ADMIN_PASSWORD
                    </small>
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    .login-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        backdrop-filter: blur(4px);
    }

    .login-modal {
        background: white;
        border-radius: 12px;
        width: 90%;
        max-width: 400px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    .login-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 24px 24px 0;
        border-bottom: 1px solid #f3f4f6;
        margin-bottom: 24px;
    }

    .login-header h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: #1f2937;
    }

    .close-btn {
        background: none;
        border: none;
        font-size: 1.5rem;
        color: #6b7280;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s;
    }

    .close-btn:hover {
        background-color: #f3f4f6;
        color: #1f2937;
    }

    .login-content {
        padding: 0 24px 24px;
    }

    .login-description {
        color: #6b7280;
        margin-bottom: 24px;
        text-align: center;
    }

    .form-group {
        margin-bottom: 20px;
    }

    .form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: #374151;
    }

    .form-group input {
        width: 100%;
        padding: 12px 16px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 1rem;
        transition: all 0.2s;
        box-sizing: border-box;
    }

    .form-group input:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-group input:disabled {
        background-color: #f9fafb;
        color: #9ca3af;
        cursor: not-allowed;
    }

    .error-message {
        background-color: #fef2f2;
        border: 1px solid #fecaca;
        color: #dc2626;
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 20px;
        font-size: 0.875rem;
    }

    .form-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        margin-bottom: 20px;
    }

    .btn-primary, .btn-secondary {
        padding: 10px 20px;
        border-radius: 8px;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
    }

    .btn-primary {
        background-color: #3b82f6;
        color: white;
    }

    .btn-primary:hover:not(:disabled) {
        background-color: #2563eb;
    }

    .btn-primary:disabled {
        background-color: #9ca3af;
        cursor: not-allowed;
    }

    .btn-secondary {
        background-color: #f3f4f6;
        color: #374151;
        border: 1px solid #d1d5db;
    }

    .btn-secondary:hover:not(:disabled) {
        background-color: #e5e7eb;
    }

    .btn-secondary:disabled {
        color: #9ca3af;
        cursor: not-allowed;
    }

    .login-note {
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 16px;
        text-align: center;
    }

    .login-note small {
        color: #64748b;
        line-height: 1.5;
    }

    @media (max-width: 480px) {
        .login-modal {
            width: 95%;
            margin: 20px;
        }

        .login-header {
            padding: 20px 20px 0;
        }

        .login-content {
            padding: 0 20px 20px;
        }

        .form-actions {
            flex-direction: column;
        }

        .btn-primary, .btn-secondary {
            width: 100%;
        }
    }
</style>