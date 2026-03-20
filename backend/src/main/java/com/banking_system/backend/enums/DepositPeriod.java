package com.banking_system.backend.enums;

import java.math.BigDecimal;

public enum DepositPeriod {

    DAYS_100(100, new BigDecimal("6.5"), "100 Days"),
    MONTHS_6(182, new BigDecimal("7.0"), "6 Months"),
    YEAR_1(365, new BigDecimal("8.0"), "1 Year"),
    YEARS_5(1825, new BigDecimal("10.0"), "5 Years");

    private final int days;
    private final BigDecimal interestRate;
    private final String label;

    DepositPeriod(int days, BigDecimal interestRate, String label) {
        this.days = days;
        this.interestRate = interestRate;
        this.label = label;
    }

    public int getDays() { return days; }
    public BigDecimal getInterestRate() { return interestRate; }
    public String getLabel() { return label; }
}
