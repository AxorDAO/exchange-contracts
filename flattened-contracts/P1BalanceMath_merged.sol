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

library P1Types {
    // ============ Structs ============

    /**
     * @dev Used to represent the global index and each account's cached index.
     *  Used to settle funding paymennts on a per-account basis.
     */
    struct Index {
        uint32 timestamp;
        bool isPositive;
        uint128 value;
    }

    /**
     * @dev Used to track the signed margin balance and position balance values for each account.
     */
    struct Balance {
        bool marginIsPositive;
        bool positionIsPositive;
        uint120 margin;
        uint120 position;
    }

    /**
     * @dev Used to cache commonly-used variables that are relatively gas-intensive to obtain.
     */
    struct Context {
        uint256 price;
        uint256 minCollateral;
        Index index;
    }

    /**
     * @dev Used by contracts implementing the I_P1Trader interface to return the result of a trade.
     */
    struct TradeResult {
        uint256 marginAmount;
        uint256 positionAmount;
        bool isBuy; // From taker's perspective.
        bytes32 traderFlags;
    }
}

library BaseMath {
    using SafeMath for uint256;

    // The number One in the BaseMath system.
    uint256 constant internal BASE = 10 ** 18;

    /**
     * @dev Getter function since constants can't be read directly from libraries.
     */
    function base()
        internal
        pure
        returns (uint256)
    {
        return BASE;
    }

    /**
     * @dev Multiplies a value by a base value (result is rounded down).
     */
    function baseMul(
        uint256 value,
        uint256 baseValue
    )
        internal
        pure
        returns (uint256)
    {
        return value.mul(baseValue).div(BASE);
    }

    /**
     * @dev Multiplies a value by a base value (result is rounded down).
     *  Intended as an alternaltive to baseMul to prevent overflow, when `value` is known
     *  to be divisible by `BASE`.
     */
    function baseDivMul(
        uint256 value,
        uint256 baseValue
    )
        internal
        pure
        returns (uint256)
    {
        return value.div(BASE).mul(baseValue);
    }

    /**
     * @dev Multiplies a value by a base value (result is rounded up).
     */
    function baseMulRoundUp(
        uint256 value,
        uint256 baseValue
    )
        internal
        pure
        returns (uint256)
    {
        if (value == 0 || baseValue == 0) {
            return 0;
        }
        return value.mul(baseValue).sub(1).div(BASE).add(1);
    }

    /**
     * @dev Divide a value by a base value (result is rounded down).
     */
    function baseDiv(
        uint256 value,
        uint256 baseValue
    )
        internal
        pure
        returns (uint256)
    {
        return value.mul(BASE).div(baseValue);
    }

    /**
     * @dev Returns a base value representing the reciprocal of another base value (result is
     *  rounded down).
     */
    function baseReciprocal(
        uint256 baseValue
    )
        internal
        pure
        returns (uint256)
    {
        return baseDiv(BASE, baseValue);
    }
}

library SafeCast {

    /**
     * @dev Returns the downcasted uint128 from uint256, reverting on
     *  overflow (i.e. when the input is greater than largest uint128).
     *
     *  Counterpart to Solidity's `uint128` operator.
     *
     *  Requirements:
     *  - `value` must fit into 128 bits.
     */
    function toUint128(
        uint256 value
    )
        internal
        pure
        returns (uint128)
    {
        require(value < 2**128, "SafeCast: value doesn\'t fit in 128 bits");
        return uint128(value);
    }

    /**
     * @dev Returns the downcasted uint120 from uint256, reverting on
     *  overflow (i.e. when the input is greater than largest uint120).
     *
     *  Counterpart to Solidity's `uint120` operator.
     *
     *  Requirements:
     *  - `value` must fit into 120 bits.
     */
    function toUint120(
        uint256 value
    )
        internal
        pure
        returns (uint120)
    {
        require(value < 2**120, "SafeCast: value doesn\'t fit in 120 bits");
        return uint120(value);
    }

    /**
     * @dev Returns the downcasted uint32 from uint256, reverting on
     *  overflow (i.e. when the input is greater than largest uint32).
     *
     *  Counterpart to Solidity's `uint32` operator.
     *
     *  Requirements:
     *  - `value` must fit into 32 bits.
     */
    function toUint32(
        uint256 value
    )
        internal
        pure
        returns (uint32)
    {
        require(value < 2**32, "SafeCast: value doesn\'t fit in 32 bits");
        return uint32(value);
    }
}

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
 * @title P1BalanceMath
 * @author axor
 *
 * @dev Library for manipulating P1Types.Balance structs.
 */
library P1BalanceMath {
    using BaseMath for uint256;
    using SafeCast for uint256;
    using SafeMath for uint256;
    using SignedMath for SignedMath.Int;
    using P1BalanceMath for P1Types.Balance;

    // ============ Constants ============

    uint256 private constant FLAG_MARGIN_IS_POSITIVE = 1 << (8 * 31);
    uint256 private constant FLAG_POSITION_IS_POSITIVE = 1 << (8 * 15);

    // ============ Functions ============

    /**
     * @dev Create a copy of the balance struct.
     */
    function copy(
        P1Types.Balance memory balance
    )
        internal
        pure
        returns (P1Types.Balance memory)
    {
        return P1Types.Balance({
            marginIsPositive: balance.marginIsPositive,
            positionIsPositive: balance.positionIsPositive,
            margin: balance.margin,
            position: balance.position
        });
    }

    /**
     * @dev In-place add amount to balance.margin.
     */
    function addToMargin(
        P1Types.Balance memory balance,
        uint256 amount
    )
        internal
        pure
    {
        SignedMath.Int memory signedMargin = balance.getMargin();
        signedMargin = signedMargin.add(amount);
        balance.setMargin(signedMargin);
    }

    /**
     * @dev In-place subtract amount from balance.margin.
     */
    function subFromMargin(
        P1Types.Balance memory balance,
        uint256 amount
    )
        internal
        pure
    {
        SignedMath.Int memory signedMargin = balance.getMargin();
        signedMargin = signedMargin.sub(amount);
        balance.setMargin(signedMargin);
    }

    /**
     * @dev In-place add amount to balance.position.
     */
    function addToPosition(
        P1Types.Balance memory balance,
        uint256 amount
    )
        internal
        pure
    {
        SignedMath.Int memory signedPosition = balance.getPosition();
        signedPosition = signedPosition.add(amount);
        balance.setPosition(signedPosition);
    }

    /**
     * @dev In-place subtract amount from balance.position.
     */
    function subFromPosition(
        P1Types.Balance memory balance,
        uint256 amount
    )
        internal
        pure
    {
        SignedMath.Int memory signedPosition = balance.getPosition();
        signedPosition = signedPosition.sub(amount);
        balance.setPosition(signedPosition);
    }

    /**
     * @dev Returns the positive and negative values of the margin and position together, given a
     *  price, which is used as a conversion rate between the two currencies.
     *
     *  No rounding occurs here--the returned values are "base values" with extra precision.
     */
    function getPositiveAndNegativeValue(
        P1Types.Balance memory balance,
        uint256 price
    )
        internal
        pure
        returns (uint256, uint256)
    {
        uint256 positiveValue = 0;
        uint256 negativeValue = 0;

        // add value of margin
        if (balance.marginIsPositive) {
            positiveValue = uint256(balance.margin).mul(BaseMath.base());
        } else {
            negativeValue = uint256(balance.margin).mul(BaseMath.base());
        }

        // add value of position
        uint256 positionValue = uint256(balance.position).mul(price);
        if (balance.positionIsPositive) {
            positiveValue = positiveValue.add(positionValue);
        } else {
            negativeValue = negativeValue.add(positionValue);
        }

        return (positiveValue, negativeValue);
    }

    /**
     * @dev Returns a compressed bytes32 representation of the balance for logging.
     */
    function toBytes32(
        P1Types.Balance memory balance
    )
        internal
        pure
        returns (bytes32)
    {
        uint256 result =
            uint256(balance.position)
            | (uint256(balance.margin) << 128)
            | (balance.marginIsPositive ? FLAG_MARGIN_IS_POSITIVE : 0)
            | (balance.positionIsPositive ? FLAG_POSITION_IS_POSITIVE : 0);
        return bytes32(result);
    }

    // ============ Helper Functions ============

    /**
     * @dev Returns a SignedMath.Int version of the margin in balance.
     */
    function getMargin(
        P1Types.Balance memory balance
    )
        internal
        pure
        returns (SignedMath.Int memory)
    {
        return SignedMath.Int({
            value: balance.margin,
            isPositive: balance.marginIsPositive
        });
    }

    /**
     * @dev Returns a SignedMath.Int version of the position in balance.
     */
    function getPosition(
        P1Types.Balance memory balance
    )
        internal
        pure
        returns (SignedMath.Int memory)
    {
        return SignedMath.Int({
            value: balance.position,
            isPositive: balance.positionIsPositive
        });
    }

    /**
     * @dev In-place modify the signed margin value of a balance.
     */
    function setMargin(
        P1Types.Balance memory balance,
        SignedMath.Int memory newMargin
    )
        internal
        pure
    {
        balance.margin = newMargin.value.toUint120();
        balance.marginIsPositive = newMargin.isPositive;
    }

    /**
     * @dev In-place modify the signed position value of a balance.
     */
    function setPosition(
        P1Types.Balance memory balance,
        SignedMath.Int memory newPosition
    )
        internal
        pure
    {
        balance.position = newPosition.value.toUint120();
        balance.positionIsPositive = newPosition.isPositive;
    }
}