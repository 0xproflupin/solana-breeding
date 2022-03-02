import { 
    createTransferCheckedInstruction, getAccount, getAssociatedTokenAddress,
    getMint, createAssociatedTokenAccountInstruction
} from '@solana/spl-token';
import {
    Connection,
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    Transaction,
    TransactionInstruction,
} from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { MEMO_PROGRAM_ID, SOL_DECIMALS, TEN } from './constants';

/**
 * Thrown when a valid transaction can't be created from the inputs provided.
 */
export class CreateTransactionError extends Error {
    name = 'CreateTransactionError';
}

/**
 * Optional parameters for creating a Solana Pay transaction.
 */
export interface CreateTransactionParams {
    /** `splToken` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#spl-token) */
    splToken?: PublicKey;
    /** `reference` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#reference) */
    reference?: PublicKey | PublicKey[];
    /** `memo` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#memo) */
    memo?: string;
}

export async function addInstruction(
    transaction: Transaction,
    connection: Connection,
    payer: PublicKey,
    recipient: PublicKey,
    amount: BigNumber,
    splToken: PublicKey
): Promise<Transaction> {
    // Check that the payer and recipient accounts exist
    const payerInfo = await connection.getAccountInfo(payer);
    if (!payerInfo) throw new CreateTransactionError('payer not found');

    const recipientInfo = await connection.getAccountInfo(recipient);
    if (!recipientInfo) throw new CreateTransactionError('recipient not found');

    // A native SOL or SPL token transfer instruction
    let instruction: TransactionInstruction;

    
    // Check that the token provided is an initialized mint
    const mint = await getMint(connection, splToken);
    if (!mint.isInitialized) throw new CreateTransactionError('mint not initialized');

    // Check that the amount provided doesn't have greater precision than the mint
    if (amount.decimalPlaces() > mint.decimals) throw new CreateTransactionError('amount decimals invalid');

    // Convert input decimal amount to integer tokens according to the mint decimals
    amount = amount.times(TEN.pow(mint.decimals)).integerValue(BigNumber.ROUND_FLOOR);

    // Get the payer's ATA and check that the account exists and can send tokens
    const payerATA = await getAssociatedTokenAddress(splToken, payer);
    const payerAccount = await getAccount(connection, payerATA);
    if (!payerAccount.isInitialized) throw new CreateTransactionError('payer not initialized');
    if (payerAccount.isFrozen) throw new CreateTransactionError('payer frozen');

    // Get the recipient's ATA and check that the account exists and can receive tokens
    const recipientATA = await getAssociatedTokenAddress(splToken, recipient);
    console.log(recipientATA);

    const receiverAccount = await connection.getAccountInfo(recipientATA);
        
    if (receiverAccount === null) {
        transaction.add(
            createAssociatedTokenAccountInstruction(
                payer,
                recipientATA,
                recipient,
                splToken
            )
        )
    }

    // Check that the payer has enough tokens
    const tokens = BigInt(String(amount));
    if (tokens > payerAccount.amount) throw new CreateTransactionError('insufficient funds');

    // Create an instruction to transfer SPL tokens, asserting the mint and decimals match
    instruction = createTransferCheckedInstruction(payerATA, splToken, recipientATA, payer, tokens, mint.decimals);

    // Add the transfer instruction to the transaction
    transaction.add(instruction);

    return transaction;
}
