pragma solidity 0.5.16;
pragma experimental ABIEncoderV2;


library SafeMath {
    /**
     * @dev Returns the addition of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `+` operator.
     *
     * Requirements:
     * - Addition cannot overflow.
     */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");

        return c;
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, reverting on
     * overflow (when the result is negative).
     *
     * Counterpart to Solidity's `-` operator.
     *
     * Requirements:
     * - Subtraction cannot overflow.
     */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return sub(a, b, "SafeMath: subtraction overflow");
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, reverting with custom message on
     * overflow (when the result is negative).
     *
     * Counterpart to Solidity's `-` operator.
     *
     * Requirements:
     * - Subtraction cannot overflow.
     *
     * _Available since v2.4.0._
     */
    function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b <= a, errorMessage);
        uint256 c = a - b;

        return c;
    }

    /**
     * @dev Returns the multiplication of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `*` operator.
     *
     * Requirements:
     * - Multiplication cannot overflow.
     */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
        // benefit is lost if 'b' is also tested.
        // See: https://github.com/OpenZeppelin/openzeppelin-contracts/pull/522
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");

        return c;
    }

    /**
     * @dev Returns the integer division of two unsigned integers. Reverts on
     * division by zero. The result is rounded towards zero.
     *
     * Counterpart to Solidity's `/` operator. Note: this function uses a
     * `revert` opcode (which leaves remaining gas untouched) while Solidity
     * uses an invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     * - The divisor cannot be zero.
     */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return div(a, b, "SafeMath: division by zero");
    }

    /**
     * @dev Returns the integer division of two unsigned integers. Reverts with custom message on
     * division by zero. The result is rounded towards zero.
     *
     * Counterpart to Solidity's `/` operator. Note: this function uses a
     * `revert` opcode (which leaves remaining gas untouched) while Solidity
     * uses an invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     * - The divisor cannot be zero.
     *
     * _Available since v2.4.0._
     */
    function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        // Solidity only automatically asserts when dividing by 0
        require(b > 0, errorMessage);
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold

        return c;
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
     * Reverts when dividing by zero.
     *
     * Counterpart to Solidity's `%` operator. This function uses a `revert`
     * opcode (which leaves remaining gas untouched) while Solidity uses an
     * invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     * - The divisor cannot be zero.
     */
    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        return mod(a, b, "SafeMath: modulo by zero");
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
     * Reverts with custom message when dividing by zero.
     *
     * Counterpart to Solidity's `%` operator. This function uses a `revert`
     * opcode (which leaves remaining gas untouched) while Solidity uses an
     * invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     * - The divisor cannot be zero.
     *
     * _Available since v2.4.0._
     */
    function mod(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b != 0, errorMessage);
        return a % b;
    }
}

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
/**
 * @title SignedMath
 * @author axor
 *
 * @dev SignedMath library for doing math with signed integers.
 */
library SignedMath {
    using SafeMath for uint256;

    // ============ Structs ============

    struct Int {
        uint256 value;
        bool isPositive;
    }

    // ============ Functions ============

    /**
     * @dev Returns a new signed integer equal to a signed integer plus an unsigned integer.
     */
    function add(
        Int memory sint,
        uint256 value
    )
        internal
        pure
        returns (Int memory)
    {
        if (sint.isPositive) {
            return Int({
                value: value.add(sint.value),
                isPositive: true
            });
        }
        if (sint.value < value) {
            return Int({
                value: value.sub(sint.value),
                isPositive: true
            });
        }
        return Int({
            value: sint.value.sub(value),
            isPositive: false
        });
    }

    /**
     * @dev Returns a new signed integer equal to a signed integer minus an unsigned integer.
     */
    function sub(
        Int memory sint,
        uint256 value
    )
        internal
        pure
        returns (Int memory)
    {
        if (!sint.isPositive) {
            return Int({
                value: value.add(sint.value),
                isPositive: false
            });
        }
        if (sint.value > value) {
            return Int({
                value: sint.value.sub(value),
                isPositive: true
            });
        }
        return Int({
            value: value.sub(sint.value),
            isPositive: false
        });
    }

    /**
     * @dev Returns a new signed integer equal to a signed integer plus another signed integer.
     */
    function signedAdd(
        Int memory augend,
        Int memory addend
    )
        internal
        pure
        returns (Int memory)
    {
        return addend.isPositive
            ? add(augend, addend.value)
            : sub(augend, addend.value);
    }

    /**
     * @dev Returns a new signed integer equal to a signed integer minus another signed integer.
     */
    function signedSub(
        Int memory minuend,
        Int memory subtrahend
    )
        internal
        pure
        returns (Int memory)
    {
        return subtrahend.isPositive
            ? sub(minuend, subtrahend.value)
            : add(minuend, subtrahend.value);
    }

    /**
     * @dev Returns true if signed integer `a` is greater than signed integer `b`, false otherwise.
     */
    function gt(
        Int memory a,
        Int memory b
    )
        internal
        pure
        returns (bool)
    {
        if (a.isPositive) {
            if (b.isPositive) {
                return a.value > b.value;
            } else {
                // True, unless both values are zero.
                return a.value != 0 || b.value != 0;
            }
        } else {
            if (b.isPositive) {
                return false;
            } else {
                return a.value < b.value;
            }
        }
    }

    /**
     * @dev Returns the minimum of signed integers `a` and `b`.
     */
    function min(
        Int memory a,
        Int memory b
    )
        internal
        pure
        returns (Int memory)
    {
        return gt(b, a) ? a : b;
    }

    /**
     * @dev Returns the maximum of signed integers `a` and `b`.
     */
    function max(
        Int memory a,
        Int memory b
    )
        internal
        pure
        returns (Int memory)
    {
        return gt(a, b) ? a : b;
    }
}