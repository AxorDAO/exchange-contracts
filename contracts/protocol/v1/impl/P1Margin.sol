/*

    Copyright 2024 Axor DAO

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

*/

pragma solidity 0.5.16;
pragma experimental ABIEncoderV2;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import { P1FinalSettlement } from "./P1FinalSettlement.sol";
import { P1Getters } from "./P1Getters.sol";
import { P1BalanceMath } from "../lib/P1BalanceMath.sol";
import { P1Types } from "../lib/P1Types.sol";

/**
 * @title P1Margin
 * @author axor
 *
 * @notice Contract for withdrawing and depositing.
 */
contract P1Margin is
    P1FinalSettlement,
    P1Getters
{
    using P1BalanceMath for P1Types.Balance;

    // ============ Events ============

    event LogDeposit(
        address indexed account,
        uint256 amount,
        bytes32 balance
    );

    event LogWithdraw(
        address indexed account,
        address destination,
        uint256 amount,
        bytes32 balance
    );

    event LogUserForceWithdraw(
        address indexed account,
        address destination,
        uint256 amount,
        bool settlementIsPositive,
        uint256 settlementAmount,
        bytes32 balance
    );

    event LogSetWithdraw(
        address indexed account,
        address destination
    );
    event CancelRequestWithdraw(
        address indexed account,
        address destination
    );

    // ============ Functions ============

    /**
     * @notice Deposit some amount of margin tokens from the msg.sender into an account.
     * @dev Emits LogIndex, LogAccountSettled, and LogDeposit events.
     *
     * @param  account  The account for which to credit the deposit.
     * @param  amount   the amount of tokens to deposit.
     */
    function deposit(
        address from,
        address account,
        uint256 amount,
        uint256 price,
        uint256 settlementAmounts,
        bool settlementIsPositives
    )
        external
        noFinalSettlement
        nonReentrant
    {
        require(
            _GLOBAL_OPERATORS_[msg.sender],
            "trader is not global operator"
        );
        P1Types.Context memory context = _loadContextWithPrice(price);
        P1Types.Balance memory balance = _settleAccount(context, account, settlementAmounts, settlementIsPositives);

        SafeERC20.safeTransferFrom(
            IERC20(_TOKEN_),
            from,
            address(this),
            amount
        );

        balance.addToMargin(amount);
        _BALANCES_[account] = balance;

        emit LogDeposit(
            account,
            amount,
            balance.toBytes32()
        );
    }

    /**
     * @notice Set Withdraw acction.
     * @dev Emits LogIndex, LogAccountSettled, and LogWithdraw events.
     *
     * @param  account      The account for which to debit the withdrawal.
     * @param  destination  The address to which the tokens are transferred.
     */
    function requestWithdraw(
        address account,
        address destination
    )
        external
        noFinalSettlement
        nonReentrant
    {
        require(
            hasAccountPermissions(account, msg.sender),
            "sender does not have permission to withdraw"
        );

        _WITHDRAW_DELAY_[account] = block.number;

        emit LogSetWithdraw(
            account,
            destination
        );
    }

    function cancelRequestWithdraw(
        address account,
        address destination
    )
        external
        noFinalSettlement
        nonReentrant
    {
        require(
            hasAccountPermissions(account, msg.sender),
            "sender does not have permission to withdraw"
        );

        _WITHDRAW_DELAY_[account] = 0;

        emit CancelRequestWithdraw(
            account,
            destination
        );
    }

    /**
     * @notice Withdraw some amount of margin tokens from an account to a destination address.
     * @dev Emits LogIndex, LogAccountSettled, and LogWithdraw events.
     *
     * @param  account      The account for which to debit the withdrawal.
     * @param  destination  The address to which the tokens are transferred.
     * @param  amount       The amount of tokens to withdraw.
     * @param  price        The oracle price at the time of the withdrawal.
     */
    function withdraw(
        address account,
        address destination,
        uint256 amount,
        uint256 price,
        uint256 settlementAmounts,
        bool settlementIsPositives
    )
        external
        noFinalSettlement
        nonReentrant
    {
        require(
            _GLOBAL_OPERATORS_[msg.sender],
            "only global operator can withdraw"
        );

        P1Types.Context memory context = _loadContextWithPrice(price);
        P1Types.Balance memory balance = _settleAccount(context, account, settlementAmounts, settlementIsPositives);
        _WITHDRAW_DELAY_[account] = 0;
        
        SafeERC20.safeTransfer(
            IERC20(_TOKEN_),
            destination,
            amount
        );

        balance.subFromMargin(amount);
        _BALANCES_[account] = balance;

        require(
            _isCollateralized(context, balance),
            "account not collateralized"
        );

        emit LogWithdraw(
            account,
            destination,
            amount,
            balance.toBytes32()
        );
    }

    /**
     * @notice Withdraw some amount of margin tokens from an account to a destination address.
     * @dev Emits LogIndex, LogAccountSettled, and LogWithdraw events.
     *
     * @param  account      The account for which to debit the withdrawal.
     * @param  destination  The address to which the tokens are transferred.
     * @param  amount       The amount of tokens to withdraw.
     */
    function userWithdraw(
        address account,
        address destination,
        uint256 amount
    )
        external
        noFinalSettlement
        nonReentrant
    {
        require(
            hasAccountPermissions(account, msg.sender),
            "sender does not have permission to withdraw"
        );
        require(
            (
                _WITHDRAW_DELAY_[account] > 0 &&
                _WITHDRAW_DELAY_[account] + _WITHDRAW_DELAY_BLOCK_ <= block.number
            ),
            "cannot withdraw"
        );

        _WITHDRAW_DELAY_[account] = 0;

        P1Types.Context memory context = _loadContext();
        (P1Types.Balance memory balance, bool settlementIsPositive, uint256 settlementAmount) = _settleAccountWhenUserForceWithdraw(context, account);

        require(
            amount >= settlementAmount,
            "insufficient balance to cover funding fee"
        );
        if (settlementIsPositive) {
            amount += settlementAmount;
        } else {
            amount -= settlementAmount;
        }

        SafeERC20.safeTransfer(
            IERC20(_TOKEN_),
            destination,
            amount
        );

        balance.subFromMargin(amount);
        _BALANCES_[account] = balance;

        require(
            _isCollateralized(context, balance),
            "account not collateralized"
        );

        emit LogUserForceWithdraw(
            account,
            destination,
            amount,
            settlementIsPositive,
            settlementAmount,
            balance.toBytes32()
        );
    }
}
