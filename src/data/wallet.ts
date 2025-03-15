
import { WalletModel, WalletType, Wallet, WalletStatus } from "../nobox/record-structures/wallet";
import { Transaction } from "../nobox/record-structures/transaction";
import { unknown_error } from "../lib/variables";
import {io} from ".."

type FullWallet = Wallet & {
    id: string
}
export const addToUserWalletBalance = async (wallet: FullWallet, transaction: Transaction, authorizationCode?: string) => {
    const balance = wallet.balance + transaction.amount;
    const totalDeposits = wallet.totalDeposits + transaction.amount;
    const lastTransactionAt = new Date().toISOString();

    try {
        const data = {
            balance: parseFloat(balance.toFixed(2)),
            totalDeposits: parseFloat(totalDeposits.toFixed(2)),
            lastTransactionAt,
            ...(authorizationCode ? { authorizationCode } : {})
        }
        const updatedWallet = await WalletModel.updateOneById(wallet.id, data);
        if (!updatedWallet) {
            throw new Error(unknown_error);

        }
        
        io.emit("wallet:update", updatedWallet)
        return updatedWallet
    } catch (error) {
        throw error
    }
}

export const findWalletByUserId = async (userId: string, type: WalletType = WalletType.USER) => {
    try {
        const wallet = await WalletModel.findOne({ userId, type, status: WalletStatus.ACTIVE });
        return wallet
    } catch (error) {
        throw error
    }
}
export const addToWallet = async (walletId: string, rideCost: number, prevBalance: number) => {
    try {
        const balance = prevBalance + rideCost;
        const lastTransactionAt = new Date().toISOString();
        const updatedWallet = await WalletModel.updateOneById(walletId, {
            balance,
            lastTransactionAt,
        });
        if (!updatedWallet) {
            throw new Error(unknown_error)
        }

        
        io.emit("wallet:update", updatedWallet)
        return updatedWallet
    } catch (error) {
        throw error
    }
}
export const deductFromWallet = async (walletId: string, amount: number, prevBalance: number) => {
    try {
        const balance = prevBalance - amount;
        
        const lastTransactionAt = new Date().toISOString();
        const updatedWallet = await WalletModel.updateOneById(walletId, {
            balance,
            lastTransactionAt
        });
        if (!updatedWallet) {
            throw new Error(unknown_error)
        }
        
        io.emit("wallet:update", updatedWallet)
        return updatedWallet
    } catch (error) {
        throw error
    }
}


export const createWallet = async (userId: string, type: WalletType) => {
    try {
        const total = 0.00
        const wallet = await WalletModel.insertOne({
            userId,
            balance: total,
            currency: "₦",
            status: WalletStatus.ACTIVE,
            totalDeposits: total,
            totalWithdrawals: total,
            isDefaultPaymentMethod: true,
            type


        });
        if (!wallet) {
            throw new Error(unknown_error)
        }
        return wallet
    } catch (error) {
        throw error
    }
}