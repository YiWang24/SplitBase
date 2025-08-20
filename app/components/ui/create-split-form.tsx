"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Name, useName } from "@coinbase/onchainkit/identity";
import { base } from "viem/chains";
import { Plus, ArrowRight, Wallet, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreateSplitBillInput, BASE_PAY_CONFIG } from "@/lib/types";
import ShareModal from "./share-modal";

// Currency configuration - using real exchange rate API
// Ordered with Singapore Dollar at the top, followed by other currencies
const CURRENCIES = [
  {
    code: "SGD",
    name: "Singapore Dollar",
    symbol: "S$",
    rate: 0,
    apiCode: "SGD",
  },
  { code: "EUR", name: "Euro", symbol: "€", rate: 0, apiCode: "EUR" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", rate: 0, apiCode: "JPY" },
  { code: "BGN", name: "Bulgarian Lev", symbol: "лв", rate: 0, apiCode: "BGN" },
  {
    code: "CZK",
    name: "Czech Republic Koruna",
    symbol: "Kč",
    rate: 0,
    apiCode: "CZK",
  },
  { code: "DKK", name: "Danish Krone", symbol: "kr", rate: 0, apiCode: "DKK" },
  {
    code: "GBP",
    name: "British Pound Sterling",
    symbol: "£",
    rate: 0,
    apiCode: "GBP",
  },
  {
    code: "HUF",
    name: "Hungarian Forint",
    symbol: "Ft",
    rate: 0,
    apiCode: "HUF",
  },
  { code: "PLN", name: "Polish Zloty", symbol: "zł", rate: 0, apiCode: "PLN" },
  { code: "RON", name: "Romanian Leu", symbol: "lei", rate: 0, apiCode: "RON" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr", rate: 0, apiCode: "SEK" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", rate: 0, apiCode: "CHF" },
  {
    code: "ISK",
    name: "Icelandic Króna",
    symbol: "kr",
    rate: 0,
    apiCode: "ISK",
  },
  {
    code: "NOK",
    name: "Norwegian Krone",
    symbol: "kr",
    rate: 0,
    apiCode: "NOK",
  },
  { code: "HRK", name: "Croatian Kuna", symbol: "kn", rate: 0, apiCode: "HRK" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽", rate: 0, apiCode: "RUB" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺", rate: 0, apiCode: "TRY" },
  {
    code: "AUD",
    name: "Australian Dollar",
    symbol: "A$",
    rate: 0,
    apiCode: "AUD",
  },
  {
    code: "BRL",
    name: "Brazilian Real",
    symbol: "R$",
    rate: 0,
    apiCode: "BRL",
  },
  {
    code: "CAD",
    name: "Canadian Dollar",
    symbol: "C$",
    rate: 0,
    apiCode: "CAD",
  },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", rate: 0, apiCode: "CNY" },
  {
    code: "HKD",
    name: "Hong Kong Dollar",
    symbol: "HK$",
    rate: 0,
    apiCode: "HKD",
  },
  {
    code: "IDR",
    name: "Indonesian Rupiah",
    symbol: "Rp",
    rate: 0,
    apiCode: "IDR",
  },
  {
    code: "ILS",
    name: "Israeli New Sheqel",
    symbol: "₪",
    rate: 0,
    apiCode: "ILS",
  },
  { code: "INR", name: "Indian Rupee", symbol: "₹", rate: 0, apiCode: "INR" },
  {
    code: "KRW",
    name: "South Korean Won",
    symbol: "₩",
    rate: 0,
    apiCode: "KRW",
  },
  { code: "MXN", name: "Mexican Peso", symbol: "$", rate: 0, apiCode: "MXN" },
  {
    code: "MYR",
    name: "Malaysian Ringgit",
    symbol: "RM",
    rate: 0,
    apiCode: "MYR",
  },
  {
    code: "NZD",
    name: "New Zealand Dollar",
    symbol: "NZ$",
    rate: 0,
    apiCode: "NZD",
  },
  {
    code: "PHP",
    name: "Philippine Peso",
    symbol: "₱",
    rate: 0,
    apiCode: "PHP",
  },
  { code: "THB", name: "Thai Baht", symbol: "฿", rate: 0, apiCode: "THB" },
  {
    code: "ZAR",
    name: "South African Rand",
    symbol: "R",
    rate: 0,
    apiCode: "ZAR",
  },
];

// Exchange rate API configuration
const EXCHANGE_RATE_API = {
  baseUrl:
    process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_BASE_URL ||
    "https://api.freecurrencyapi.com/v1/latest",
  apiKey: process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY || "",
  baseCurrency: "USD",
};

// Utility function for precise currency conversion
const convertCurrencyToUSD = (amount: string, rate: number): string => {
  if (rate <= 0) return "0.00";

  // Convert to number and perform division
  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount)) return "0.00";

  // Convert other currency to USD: amount / rate = USD amount
  const usdAmount = numericAmount / rate;

  // Round to 2 decimal places to avoid floating point precision issues
  const roundedAmount = Math.round(usdAmount * 100) / 100;

  return roundedAmount.toFixed(2);
};

interface CreateSplitFormProps {
  onSuccess: (billId: string) => void;
  onError: (error: string) => void;
}

export default function CreateSplitForm({
  onSuccess,
  onError,
}: CreateSplitFormProps) {
  const { address } = useAccount();
  const { data: basename } = useName({
    address: address!,
    chain: base,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState<
    Omit<CreateSplitBillInput, "creatorAddress" | "creatorBasename">
  >({
    title: "",
    description: "",
    totalAmount: "",
  });

  // Currency selection state
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]);
  const [otherCurrencyAmount, setOtherCurrencyAmount] = useState("");
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);
  const [currencySearchTerm, setCurrencySearchTerm] = useState("");
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(
    {},
  );
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [ratesError, setRatesError] = useState<string | null>(null);

  // Filter currency list
  const filteredCurrencies = CURRENCIES.filter((currency) =>
    currency.code.toLowerCase().includes(currencySearchTerm.toLowerCase()),
  );

  // Fetch exchange rate data
  const fetchExchangeRates = async (forceRefresh = false) => {
    if (!forceRefresh && Object.keys(exchangeRates).length > 0) return; // If exchange rates already exist and not forcing refresh, don't fetch again

    setIsLoadingRates(true);
    setRatesError(null);
    try {
      const currencyCodes = CURRENCIES.filter((c) => c.apiCode !== "USD")
        .map((c) => c.apiCode)
        .join(",");
      const response = await fetch(
        `${EXCHANGE_RATE_API.baseUrl}?apikey=${EXCHANGE_RATE_API.apiKey}&currencies=${currencyCodes}&base_currency=${EXCHANGE_RATE_API.baseCurrency}`,
      );

      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setExchangeRates(data.data);

          // Update currency exchange rates
          const updatedCurrencies = CURRENCIES.map((currency) => {
            if (currency.apiCode === "USD") {
              return { ...currency, rate: 1 };
            }
            const rate = data.data[currency.apiCode];
            return { ...currency, rate: rate || 0 };
          });

          // Update selected currency
          setSelectedCurrency(updatedCurrencies[0]);
        } else {
          setRatesError("Failed to get exchange rates data");
        }
      } else {
        setRatesError(`API error: ${response.status}`);
      }
    } catch (error) {
      console.error("Failed to fetch exchange rates:", error);
      setRatesError("Network error, please check your connection");
    } finally {
      setIsLoadingRates(false);
    }
  };

  // Handle refresh button click
  const handleRefreshRates = () => {
    fetchExchangeRates(true);
  };

  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false);
  const [createdBillData, setCreatedBillData] = useState<{
    id: string;
    title: string;
    amount: string;
    shareUrl: string;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
    // Fetch exchange rate data
    fetchExchangeRates();
  }, []);

  // Close currency selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".currency-selector")) {
        setShowCurrencySelector(false);
      }
    };

    if (showCurrencySelector) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCurrencySelector]);

  // Auto-recalculate conversion when exchange rates update
  useEffect(() => {
    if (
      otherCurrencyAmount &&
      selectedCurrency.code !== "USD" &&
      Object.keys(exchangeRates).length > 0
    ) {
      const rate =
        exchangeRates[selectedCurrency.apiCode] || selectedCurrency.rate;
      if (rate > 0) {
        // Use the utility function for precise conversion
        const usdAmount = convertCurrencyToUSD(otherCurrencyAmount, rate);
        setFormData((prev) => ({
          ...prev,
          totalAmount: usdAmount,
        }));
      }
    }
  }, [exchangeRates, selectedCurrency, otherCurrencyAmount]);

  // Handle currency selection
  const handleCurrencySelect = (currency: (typeof CURRENCIES)[0]) => {
    setSelectedCurrency(currency);
    setShowCurrencySelector(false);

    // If exchange rates are missing, try to fetch them
    if (Object.keys(exchangeRates).length === 0) {
      fetchExchangeRates(true);
    }

    // If other currency input has value, automatically convert to USD
    if (otherCurrencyAmount && currency.code !== "USD") {
      const rate = exchangeRates[currency.apiCode] || currency.rate;
      if (rate > 0) {
        // Use the utility function for precise conversion
        const usdAmount = convertCurrencyToUSD(otherCurrencyAmount, rate);
        setFormData((prev) => ({
          ...prev,
          totalAmount: usdAmount,
        }));
      }
    } else if (currency.code === "USD" && otherCurrencyAmount) {
      // If USD is selected, clear other currency input
      setOtherCurrencyAmount("");
    }
  };

  // Handle other currency amount input
  const handleOtherCurrencyInput = (value: string) => {
    setOtherCurrencyAmount(value);

    if (value && selectedCurrency.code !== "USD") {
      const rate =
        exchangeRates[selectedCurrency.apiCode] || selectedCurrency.rate;

      // If exchange rates are missing, try to fetch them
      if (rate === 0 && Object.keys(exchangeRates).length === 0) {
        fetchExchangeRates(true);
        return; // Wait for rates to be fetched before converting
      }

      if (rate > 0) {
        // Use the utility function for precise conversion
        const usdAmount = convertCurrencyToUSD(value, rate);
        setFormData((prev) => ({
          ...prev,
          totalAmount: usdAmount,
        }));
      }
    } else if (selectedCurrency.code === "USD") {
      // If USD is selected, set amount directly
      setFormData((prev) => ({
        ...prev,
        totalAmount: value,
      }));
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (
    event: React.KeyboardEvent,
    currency: (typeof CURRENCIES)[0],
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCurrencySelect(currency);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.title.trim()) {
      errors.push("Please enter split title");
    }

    const totalAmount = parseFloat(formData.totalAmount);
    if (isNaN(totalAmount) || totalAmount <= 0) {
      errors.push("Please enter valid total amount");
    }

    if (totalAmount < parseFloat(BASE_PAY_CONFIG.MIN_AMOUNT)) {
      errors.push(
        `Total amount cannot be less than ${BASE_PAY_CONFIG.MIN_AMOUNT} USDC`,
      );
    }

    if (totalAmount > parseFloat(BASE_PAY_CONFIG.MAX_AMOUNT)) {
      errors.push(
        `Total amount cannot exceed ${BASE_PAY_CONFIG.MAX_AMOUNT} USDC`,
      );
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address) {
      onError("Please connect wallet first");
      return;
    }

    const errors = validateForm();
    if (errors.length > 0) {
      onError(errors.join(", "));
      return;
    }

    setIsLoading(true);

    try {
      const createData: CreateSplitBillInput = {
        ...formData,
        creatorAddress: address,
        creatorBasename: basename ? String(basename) : undefined,
      };

      const response = await fetch("/api/split/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createData),
      });

      const result = await response.json();

      if (result.success && result.data) {
        // Set created bill data for share modal
        const shareUrl = `${window.location.origin}/split/${result.data.id}`;
        setCreatedBillData({
          id: result.data.id,
          title: formData.title,
          amount: formData.totalAmount,
          shareUrl,
        });

        // Show share modal
        setShowShareModal(true);

        // Reset form
        setFormData({
          title: "",
          description: "",
          totalAmount: "",
        });
        setOtherCurrencyAmount("");
        setSelectedCurrency(CURRENCIES[0]);
        setCurrencySearchTerm("");
        setExchangeRates({});
        setRatesError(null);

        // Call success callback
        onSuccess(result.data.id);
      } else {
        onError(result.error || "Failed to create split");
      }
    } catch (error) {
      console.error("Error creating split bill:", error);
      onError("Network error, please retry");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareModalClose = () => {
    setShowShareModal(false);
    setCreatedBillData(null);
  };

  const isFormValid =
    formData.title.trim() &&
    formData.totalAmount &&
    parseFloat(formData.totalAmount) > 0;

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <>
      <Card className="backdrop-blur-sm border-0 bg-gradient-to-br from-white/95 to-[#c9e265]/5 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
        {/* Enhanced Card Header */}
        <CardHeader className="bg-gradient-to-r from-[#c9e265]/10 to-[#89d957]/10 border-b border-[#c9e265]/20 pb-6">
          <CardTitle className="flex items-center gap-3 text-xl font-black tracking-wide">
            <div className="w-10 h-10 bg-gradient-to-br from-[#c9e265] to-[#89d957] rounded-xl flex items-center justify-center shadow-lg">
              <Plus className="h-5 w-5 text-neutral-900" />
            </div>
            <span className="bg-gradient-to-r from-[#c9e265] to-[#89d957] bg-clip-text text-transparent">
              CREATE SPLIT
            </span>
          </CardTitle>
          <CardDescription className="text-neutral-600 font-medium">
            Create a split bill and share with friends
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Split Title */}
            <div
              className="space-y-3 form-section"
              style={{ animationDelay: "0.1s" }}
            >
              <Label
                htmlFor="title"
                className="text-sm font-bold text-neutral-700 uppercase tracking-wide"
              >
                SPLIT TITLE *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g., Dinner Split, Movie Tickets..."
                maxLength={100}
                required
                className="h-12 border-2 border-[#c9e265]/20 focus:border-[#c9e265] focus:ring-[#c9e265]/20 transition-all duration-300 rounded-xl text-lg font-medium placeholder:text-neutral-400 form-input-enhanced"
              />
            </div>

            {/* Description (optional) */}
            <div
              className="space-y-3 form-section"
              style={{ animationDelay: "0.2s" }}
            >
              <Label
                htmlFor="description"
                className="text-sm font-bold text-neutral-700 uppercase tracking-wide"
              >
                DESCRIPTION (OPTIONAL)
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Add more details..."
                rows={3}
                maxLength={200}
                className="border-2 border-[#89d957]/20 focus:border-[#89d957] focus:ring-[#89d957]/20 transition-all duration-300 rounded-xl text-base placeholder:text-neutral-400 resize-none form-input-enhanced"
              />
            </div>

            {/* Currency Selection */}
            <div
              className="space-y-3 form-section"
              style={{ animationDelay: "0.25s" }}
            >
              <Label
                id="currency-label"
                className="text-sm font-bold text-neutral-700 uppercase tracking-wide"
              >
                CURRENCY SELECTION (OPTIONAL)
              </Label>
              <div className="flex items-center justify-between">
                <p className="text-xs text-neutral-500 font-medium">
                  Choose a currency to input amount, it will be automatically
                  converted to USDC
                </p>
                <button
                  type="button"
                  onClick={handleRefreshRates}
                  disabled={isLoadingRates}
                  className="p-2 hover:bg-[#c9e265]/10 rounded-lg transition-colors duration-200 disabled:opacity-50"
                  title="Refresh exchange rates"
                >
                  <div
                    className={`w-4 h-4 ${isLoadingRates ? "animate-spin" : ""}`}
                  >
                    {isLoadingRates ? (
                      <div className="w-4 h-4 border-2 border-[#c9e265] border-t-transparent rounded-full"></div>
                    ) : (
                      <svg
                        className="w-4 h-4 text-[#c9e265]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Currency selection dropdown */}
                <div className="relative currency-selector">
                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrencySelector(!showCurrencySelector)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setShowCurrencySelector(!showCurrencySelector);
                      }
                    }}
                    aria-haspopup="listbox"
                    aria-expanded={showCurrencySelector}
                    aria-labelledby="currency-label"
                    className="w-full h-12 px-4 border-2 border-[#c9e265]/20 focus:border-[#c9e265] focus:ring-[#c9e265]/20 transition-all duration-300 rounded-xl text-left bg-white flex items-center justify-between hover:border-[#c9e265]/40"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-medium">
                        {selectedCurrency.symbol}
                      </span>
                      <span className="text-sm text-neutral-600">
                        {selectedCurrency.code}
                      </span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-neutral-500 transition-transform duration-200 ${showCurrencySelector ? "rotate-180" : ""}`}
                    />
                  </button>

                  {showCurrencySelector && (
                    <div
                      role="listbox"
                      aria-labelledby="currency-label"
                      className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-[#c9e265]/20 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-200"
                    >
                      {/* Search input */}
                      <div className="sticky top-0 bg-white p-3 border-b border-[#c9e265]/20">
                        <div className="flex items-center gap-2">
                          <Input
                            type="text"
                            placeholder="Search currencies..."
                            value={currencySearchTerm}
                            onChange={(e) =>
                              setCurrencySearchTerm(e.target.value)
                            }
                            className="h-8 text-sm border-[#c9e265]/20 focus:border-[#c9e265] focus:ring-[#c9e265]/20"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrencySelector(false)}
                            className="p-1 hover:bg-[#c9e265]/10 rounded transition-colors duration-200"
                            aria-label="Close currency selector"
                          >
                            <span className="text-[#c9e265] text-sm font-bold">
                              ×
                            </span>
                          </button>
                        </div>
                      </div>

                      {filteredCurrencies.map((currency) => (
                        <button
                          key={currency.code}
                          type="button"
                          role="option"
                          aria-selected={
                            selectedCurrency.code === currency.code
                          }
                          onClick={() => handleCurrencySelect(currency)}
                          onKeyDown={(e) => handleKeyDown(e, currency)}
                          className={`w-full px-4 py-3 text-left hover:bg-[#c9e265]/10 transition-colors duration-200 flex items-center gap-3 first:rounded-t-lg last:rounded-b-lg ${
                            selectedCurrency.code === currency.code
                              ? "bg-[#c9e265]/20 text-[#c9e265] font-medium"
                              : "text-neutral-700"
                          }`}
                        >
                          <span className="text-lg font-medium">
                            {currency.symbol}
                          </span>
                          <div className="flex flex-col flex-1">
                            <span className="text-sm font-medium">
                              {currency.code}
                            </span>
                            <span className="text-xs text-neutral-500">
                              {currency.name}
                            </span>
                          </div>
                          {currency.code !== "USD" && (
                            <div className="text-right">
                              <span className="text-xs text-neutral-500">
                                {exchangeRates[currency.apiCode] &&
                                exchangeRates[currency.apiCode] > 0
                                  ? `1 ${currency.code} = ${(1 / exchangeRates[currency.apiCode]).toFixed(6)} USDC`
                                  : "Rate loading..."}
                              </span>
                            </div>
                          )}
                        </button>
                      ))}

                      {filteredCurrencies.length === 0 && (
                        <div className="px-4 py-3 text-center text-neutral-500 text-sm">
                          No currencies found
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Other currency amount input */}
                {selectedCurrency.code !== "USD" && (
                  <div className="relative">
                    <Input
                      type="number"
                      value={otherCurrencyAmount}
                      onChange={(e) => handleOtherCurrencyInput(e.target.value)}
                      placeholder={`0.00 ${selectedCurrency.code}`}
                      step="0.01"
                      className="h-12 pr-20 border-2 border-[#c9e265]/20 focus:border-[#c9e265] focus:ring-[#c9e265]/20 transition-all duration-300 rounded-xl text-lg font-medium placeholder:text-neutral-400"
                    />
                    <Badge
                      variant="secondary"
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#c9e265] to-[#89d957] text-white border-0 px-3 py-1 font-bold text-xs"
                    >
                      {selectedCurrency.code}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Display conversion information */}
              {selectedCurrency.code !== "USD" && otherCurrencyAmount && (
                <div className="p-3 bg-gradient-to-r from-[#c9e265]/10 to-[#89d957]/10 border border-[#c9e265]/20 rounded-lg">
                  <p className="text-sm text-neutral-600">
                    <span className="font-medium">
                      {otherCurrencyAmount} {selectedCurrency.code}
                    </span>{" "}
                    ≈{" "}
                    <span className="font-bold text-[#c9e265]">
                      {formData.totalAmount} USDC
                    </span>
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Rate: 1 {selectedCurrency.code} ={" "}
                    {exchangeRates[selectedCurrency.apiCode] &&
                    exchangeRates[selectedCurrency.apiCode] > 0
                      ? (1 / exchangeRates[selectedCurrency.apiCode]).toFixed(6)
                      : "loading..."}{" "}
                    USDC
                    {isLoadingRates && (
                      <span className="ml-2 text-[#c9e265]">(Loading...)</span>
                    )}
                  </p>
                </div>
              )}

              {/* Exchange rate loading status */}
              {isLoadingRates && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm text-blue-600 flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    Loading exchange rates...
                  </div>
                </div>
              )}

              {/* Exchange rate error information */}
              {ratesError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-sm text-red-600 flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {ratesError}
                    <button
                      type="button"
                      onClick={handleRefreshRates}
                      className="ml-2 text-red-500 hover:text-red-700 underline text-xs"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Total Amount */}
            <div
              className="space-y-3 form-section"
              style={{ animationDelay: "0.3s" }}
            >
              <Label
                htmlFor="totalAmount"
                className="text-sm font-bold text-neutral-700 uppercase tracking-wide"
              >
                TOTAL AMOUNT (USDC) *
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  id="totalAmount"
                  value={formData.totalAmount}
                  onChange={(e) =>
                    handleInputChange("totalAmount", e.target.value)
                  }
                  placeholder="0.00"
                  min={BASE_PAY_CONFIG.MIN_AMOUNT}
                  max={BASE_PAY_CONFIG.MAX_AMOUNT}
                  step="0.01"
                  className="h-12 pr-20 border-2 border-[#6bbf3a]/20 focus:border-[#6bbf3a] focus:ring-[#6bbf3a]/20 transition-all duration-300 rounded-xl text-lg font-bold placeholder:text-neutral-400 form-input-enhanced"
                  required
                />
                <Badge
                  variant="secondary"
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#6bbf3a] to-[#b8d14a] text-white border-0 px-3 py-1 font-bold text-xs"
                >
                  USDC
                </Badge>
              </div>
              <p className="text-xs text-neutral-500 font-medium">
                Min: {BASE_PAY_CONFIG.MIN_AMOUNT} USDC • Max:{" "}
                {BASE_PAY_CONFIG.MAX_AMOUNT} USDC
              </p>
            </div>

            {/* Creator Info */}
            {address && (
              <Card
                className="bg-gradient-to-r from-neutral-50 to-neutral-100 border-2 border-neutral-200/50 shadow-md form-section"
                style={{ animationDelay: "0.4s" }}
              >
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
                      CREATOR
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-[#c9e265] to-[#89d957] rounded-full flex items-center justify-center">
                        <Wallet className="h-3 w-3 text-neutral-900" />
                      </div>
                      <Name
                        address={address}
                        className="text-xs font-bold text-neutral-700"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Separator className="bg-gradient-to-r from-transparent via-[#c9e265]/30 to-transparent" />

            {/* Submit Button */}
            <div className="form-section" style={{ animationDelay: "0.5s" }}>
              <Button
                type="submit"
                size="lg"
                className={`w-full h-14 font-black text-lg tracking-wide transition-all duration-500 transform hover:scale-105 active:scale-95 ${
                  isFormValid && address
                    ? "bg-gradient-to-r from-[#c9e265] to-[#89d957] text-neutral-900 shadow-lg hover:shadow-xl hover:shadow-[#c9e265]/30"
                    : "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                }`}
                disabled={!isFormValid || isLoading || !address}
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin"></div>
                    CREATING...
                  </div>
                ) : (
                  <>
                    CREATE SPLIT
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Wallet Connection Reminder */}
      {!address && (
        <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
          <div className="flex items-center gap-3 text-amber-800">
            <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
              <Wallet className="h-3 w-3 text-white" />
            </div>
            <p className="text-sm font-medium">
              Connect your wallet to create a split bill
            </p>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {createdBillData && (
        <ShareModal
          isOpen={showShareModal}
          onClose={handleShareModalClose}
          shareUrl={createdBillData.shareUrl}
          billTitle={createdBillData.title}
          amount={createdBillData.amount}
        />
      )}
    </>
  );
}
