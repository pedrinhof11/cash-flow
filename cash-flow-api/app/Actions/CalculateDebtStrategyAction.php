<?php

namespace App\Actions;

class CalculateDebtStrategyAction
{
    private const MONTHS_IN_YEAR = 12;

    public function execute(array $debts, float $monthlyPayment, string $strategy): array
    {
        $sorted = $this->sortDebts($debts, $strategy);
        return $this->simulate($sorted, $monthlyPayment, $strategy);
    }

    private function sortDebts(array $debts, string $strategy): array
    {
        $sorted = $debts;

        usort($sorted, function (array $a, array $b) use ($strategy) {
            if ($strategy === 'snowball') {
                return $a['remaining_amount'] <=> $b['remaining_amount'];
            }
            return $b['interest_rate'] <=> $a['interest_rate'];
        });

        return $sorted;
    }

    private function simulate(array $debts, float $monthlyPayment, string $strategy): array
    {
        $schedule = [];
        $totalInterestPaid = 0;
        $months = 0;
        $remainingDebts = [];

        foreach ($debts as $debt) {
            $remainingDebts[] = [
                'creditor' => $debt['creditor'],
                'remaining' => $debt['remaining_amount'],
                'interest_rate' => $debt['interest_rate'],
                'minimum_payment' => $debt['minimum_payment'],
                'interest_paid' => 0,
            ];
        }

        $maxMonths = 600;

        while (count($remainingDebts) > 0 && $months < $maxMonths) {
            $months++;
            $paymentAvailable = $monthlyPayment;

            foreach ($remainingDebts as $i => &$rd) {
                $monthlyInterest = $rd['remaining'] * ($rd['interest_rate'] / 100 / self::MONTHS_IN_YEAR);
                $rd['remaining'] += $monthlyInterest;
                $rd['interest_paid'] += $monthlyInterest;

                $minPayment = min($rd['minimum_payment'], $rd['remaining']);
                $payment = min($minPayment, $paymentAvailable);

                if ($i === 0 && $paymentAvailable > $minPayment) {
                    $extra = $paymentAvailable - $minPayment;
                    $payment = min($minPayment + $extra, $rd['remaining']);
                }

                $payment = min($payment, $rd['remaining'], $paymentAvailable);

                if ($payment > 0) {
                    $rd['remaining'] -= $payment;
                    $paymentAvailable -= $payment;
                }

                if ($rd['remaining'] <= 0.01) {
                    $totalInterestPaid += $rd['interest_paid'];
                    $schedule[] = [
                        'month' => $months,
                        'creditor' => $rd['creditor'],
                        'paid_off' => true,
                        'interest_paid' => round($rd['interest_paid'], 2),
                    ];
                    unset($remainingDebts[$i]);
                    $remainingDebts = array_values($remainingDebts);
                    break;
                }
            }
            unset($rd);
        }

        $totalRemaining = array_sum(array_column($remainingDebts, 'remaining'));

        return [
            'strategy' => $strategy,
            'total_months' => $months,
            'total_interest_paid' => round($totalInterestPaid, 2),
            'debts_paid_off' => count($schedule),
            'total_debts' => count($debts),
            'remaining_total' => round($totalRemaining, 2),
            'schedule' => $schedule,
        ];
    }
}
