import { useMutation } from '@tanstack/react-query'
import { type Config, getPublicClient, getWalletClient, type ResolvedRegister } from '@wagmi/core'
import {
  simulateWithdrawERC20,
  writeWithdrawERC20,
  type WriteWithdrawERC20Parameters as WriteWithdrawERC20ActionParameters,
} from 'op-viem/actions'
import { useConfig, type UseConfigReturnType } from 'wagmi'
import type { UseWriteOPActionBaseParameters } from '../../types/UseWriteOPActionBaseParameters.js'
import type { UseWriteOPActionBaseReturnType } from '../../types/UseWriteOPActionBaseReturnType.js'

export type WriteWithdrawERC20Parameters = Omit<WriteWithdrawERC20ActionParameters, 'account'> & { chainId?: number }

export type UseWriteWithdrawERC20Parameters<config extends Config = Config, context = unknown> =
  UseWriteOPActionBaseParameters<
    WriteWithdrawERC20Parameters,
    config,
    context
  >

export type UseWriteWithdrawERC20ReturnType<config extends Config = Config, context = unknown> =
  & Omit<UseWriteOPActionBaseReturnType<WriteWithdrawERC20Parameters, config, context>, 'write' | 'writeAsync'>
  & {
    writeWithdrawERC20: UseWriteOPActionBaseReturnType<WriteWithdrawERC20Parameters, config, context>['write']
    writeWithdrawERC20Async: UseWriteOPActionBaseReturnType<WriteWithdrawERC20Parameters, config, context>['writeAsync']
  }

async function writeMutation(
  config: UseConfigReturnType,
  { chainId, ...params }: WriteWithdrawERC20Parameters,
) {
  const walletClient = await getWalletClient(config, { chainId })
  const publicClient = getPublicClient(config, { chainId })

  await simulateWithdrawERC20(publicClient, { ...params, account: walletClient.account.address, chain: undefined })
  return writeWithdrawERC20(walletClient, { ...params, account: walletClient.account.address, chain: undefined })
}

/**
 * Withdraws ERC20 tokens to an L1 address.
 * @param parameters - {@link UseWriteWithdrawERC20Parameters}
 * @returns wagmi [useWriteContract return type](https://alpha.wagmi.sh/react/api/hooks/useWrtieContract#return-type). {@link UseWriteWithdrawERC20ReturnType}
 */
export function useWriteWithdrawERC20<config extends Config = ResolvedRegister['config'], context = unknown>(
  { mutation: mutationOverride }: UseWriteWithdrawERC20Parameters<config, context> = {},
): UseWriteWithdrawERC20ReturnType<config, context> {
  const config = useConfig()

  const mutation = {
    mutationFn(params: WriteWithdrawERC20Parameters) {
      return writeMutation(config, params)
    },
    mutationKey: ['writeContract'],
  }

  const { mutate, mutateAsync, ...result } = useMutation({ ...mutation, ...mutationOverride })

  type Return = UseWriteWithdrawERC20ReturnType<config, context>
  return {
    ...result,
    writeWithdrawERC20: mutate,
    writeWithdrawERC20Async: mutateAsync,
  } as Return
}
