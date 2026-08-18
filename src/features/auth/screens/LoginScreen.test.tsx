import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/testing'
import { LoginScreen } from './LoginScreen'

describe('LoginScreen', () => {
  it('renderiza marca e campos do formulário', () => {
    renderWithProviders(<LoginScreen />, { initialEntries: ['/entrar'] })
    expect(screen.getByText('InvestWealth')).toBeInTheDocument()
    expect(screen.getByLabelText(/endereço de e-mail/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /acessar terminal/i })).toBeInTheDocument()
  })

  it('exibe link para recuperação de senha', () => {
    renderWithProviders(<LoginScreen />, { initialEntries: ['/entrar'] })
    expect(screen.getByRole('link', { name: /esqueceu\?/i })).toHaveAttribute(
      'href',
      '/recuperar-senha',
    )
  })

  it('exibe link para cadastro', () => {
    renderWithProviders(<LoginScreen />, { initialEntries: ['/entrar'] })
    expect(screen.getByRole('link', { name: /solicitar acesso/i })).toHaveAttribute(
      'href',
      '/cadastro',
    )
  })

  it('mostra erro de validação ao submeter com campos vazios', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginScreen />, { initialEntries: ['/entrar'] })

    await user.click(screen.getByRole('button', { name: /acessar terminal/i }))

    expect(await screen.findByText(/informe o seu e-mail/i)).toBeInTheDocument()
  })

  it('permite preencher e submeter credenciais válidas', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginScreen />, { initialEntries: ['/entrar'] })

    await user.type(screen.getByLabelText(/endereço de e-mail/i), 'emailteste@gmail.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'teste123')
    await user.click(screen.getByRole('button', { name: /acessar terminal/i }))

    // O botão deve mudar para estado de loading
    expect(screen.getByRole('button', { name: /autenticando/i })).toBeInTheDocument()
  })
})
