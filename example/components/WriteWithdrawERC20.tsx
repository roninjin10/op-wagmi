import { useDisclosure } from '@/hooks/useDisclosure'
import { useSimulateWithdrawERC20, useWriteWithdrawERC20 } from 'op-wagmi'
import { useState } from 'react'
import { Address, erc20Abi, isAddress, parseUnits } from 'viem'
import { useReadContract } from 'wagmi'
import { Action, ActionToggle } from './ActionToggle'
import { Button } from './Button'
import { InputGroup } from './InputGroup'
import { Modal } from './Modal'

const cbETHL2 = '0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2'

type WithdrawERC20ModalProps = {
  isOpen: boolean
  onClose: () => void
}

function WithdrawERC20Modal({ isOpen, onClose }: WithdrawERC20ModalProps) {
  const [l2Token, setL2Token] = useState(cbETHL2)
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')
  const [action, setAction] = useState<Action>('simulate')
  const { data: tokenDecimals } = useReadContract({
    address: l2Token as Address,
    abi: erc20Abi,
    functionName: 'decimals',
    chainId: 84531,
    query: { enabled: isAddress(l2Token) },
  })
  const { status: simulateStatus, refetch: simulateWithdrawERC20 } = useSimulateWithdrawERC20({
    args: {
      l2Token: cbETHL2,
      to: to as Address,
      amount: tokenDecimals ? parseUnits(amount, tokenDecimals) : BigInt(0),
      minGasLimit: 100000,
    },
    chainId: 84531,
    query: { enabled: false },
  })
  const { data, status: writeStatus, writeWithdrawERC20Async } = useWriteWithdrawERC20()

  const handleClick = async () => {
    if (action === 'simulate') {
      simulateWithdrawERC20()
    } else {
      try {
        await writeWithdrawERC20Async({
          args: {
            l2Token: cbETHL2,
            to: to as Address,
            amount: tokenDecimals ? parseUnits(amount, tokenDecimals) : BigInt(0),
            minGasLimit: 100000,
          },
          chainId: 84531,
        })
      } catch (e) {
        console.error(e)
      }
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className='flex flex-col space-y-8 pb-8'>
        <span className='text-2xl font-bold text-white'>Withdraw ERC20</span>
        <div className='flex flex-col w-full px-16 space-y-4'>
          <InputGroup
            label='L2 Token:'
            placeholder='0x...'
            value={l2Token}
            setValue={setL2Token}
          />
          <InputGroup label='To' placeholder='0x...' value={to} setValue={setTo} />
          <InputGroup label='Amount' value={amount} setValue={setAmount} />
          <ActionToggle action={action} setAction={setAction} />
          <div className='self-center'>
            <Button onClick={handleClick}>
              {`🚀 ${action === 'simulate' ? 'Simulate' : 'Write'} Withdraw ERC20 🚀`}
            </Button>
          </div>
        </div>
        {action === 'simulate' && simulateStatus && (
          <div className='flex flex-col w-full px-16 space-y-4'>
            <div className='flex flex-row justify-center space-x-8 items-center w-full'>
              <span className='text-white'>Status:</span>
              <span className='text-white'>{simulateStatus}</span>
            </div>
          </div>
        )}
        {action === 'write' && writeStatus && (
          <div className='flex flex-col w-full px-16 space-y-4'>
            <div className='flex flex-row justify-center space-x-8 items-center w-full'>
              <span className='text-white'>Status:</span>
              <span className='text-white'>{writeStatus}</span>
            </div>
            {data && (
              <div className='flex flex-row justify-center space-x-8 items-center w-full'>
                <span className='text-white'>Transaction:</span>
                <a
                  className='text-blue-500 underline'
                  target='_blank'
                  rel='noreferrer'
                  href={`https://goerli.basescan.org/tx/${data}`}
                >
                  {`${data?.slice(0, 8)}...`}
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}

export function WithdrawERC20() {
  const { isOpen, onClose, onOpen } = useDisclosure()

  return (
    <div>
      {isOpen && <WithdrawERC20Modal isOpen={isOpen} onClose={onClose} />}
      <Button
        onClick={onOpen}
      >
        Withdraw ERC20
      </Button>
    </div>
  )
}
