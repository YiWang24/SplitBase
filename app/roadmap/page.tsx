"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Receipt,
  FileText,
  Download,
  Upload,
  UserCheck,
  CreditCard,
  FileSpreadsheet,
  Zap,
  Database,
  Workflow,
  ArrowRight,
  CheckSquare,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

// Magic UI Components
import { NeonGradientCard } from "@/components/magicui/neon-gradient-card";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { AuroraText } from "@/components/magicui/aurora-text";

// Import real components
import { SplitBill } from "@/lib/types";
import { NFTData } from "@/lib/nft-types";
import ReceiptDetail from "@/app/components/ui/receipt-detail";
import SplitBillDetail from "@/app/components/ui/split-bill-detail";
import NFTDetail from "@/app/components/ui/nft-detail";

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: "completed" | "pending" | "current";
  details?: string[];
  expanded?: boolean;
}

interface Stage {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  workflow?: WorkflowStep[];
  status: "active" | "planned" | "completed";
  timeline: string;
}

export default function RoadmapPage() {
  const [activeStage, setActiveStage] = useState<string>("stage1");
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const toggleStepExpansion = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  // Mock data for real components
  const mockBill: SplitBill = {
    id: "demo-bill-001",
    title: "Restaurant Dinner",
    description: "Team dinner at Italian restaurant",
    totalAmount: "184.50",
    currency: "USDC",
    participantCount: 4,
    amountPerPerson: "46.13",
    creatorAddress: "0x1234567890abcdef1234567890abcdef12345678",
    createdAt: new Date("2025-12-15"),
    updatedAt: new Date("2025-12-15"),
    status: "completed",
    participants: [
      {
        id: "p1",
        address: "0x1234567890abcdef1234567890abcdef12345678",
        amount: "46.13",
        status: "confirmed",
        nftReceiptId: "demo-nft-001",
        displayName: "alice.base.eth",
      },
      {
        id: "p2",
        address: "0xabcdef1234567890abcdef1234567890abcdef12",
        amount: "46.13",
        status: "confirmed",
        nftReceiptId: "demo-nft-002",
        displayName: "bob.base.eth",
      },
      {
        id: "p3",
        address: "0x567890abcdef1234567890abcdef1234567890ab",
        amount: "46.13",
        status: "confirmed",
        nftReceiptId: "demo-nft-003",
        displayName: "charlie.base.eth",
      },
      {
        id: "p4",
        address: "0x90abcdef1234567890abcdef1234567890abcdef",
        amount: "46.13",
        status: "confirmed",
        nftReceiptId: "demo-nft-004",
        displayName: "diana.base.eth",
      },
    ],
  };

  const mockNFT: NFTData = {
    id: "demo-nft-001",
    billId: "demo-bill-001",
    userId: "0x1234567890abcdef1234567890abcdef12345678",
    imageData:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudCIgeDE9IjAiIHkxPSIwIiB4Mj0iMjAwIiB5Mj0iMjAwIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiM0QjdBM0EiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjN0JBNjNBIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+",
    metadata: {
      title: "Restaurant Dinner Receipt",
      participants: [
        "alice.base.eth",
        "bob.base.eth",
        "charlie.base.eth",
        "diana.base.eth",
      ],
      totalAmount: 184.5,
      location: "ramen",
      timeOfDay: "evening",
      participantCount: 4,
      amountPerPerson: 46.13,
      rarity: "COMMON",
      locationDisplayName: "Italian Restaurant",
      timeDisplayName: "Evening",
    },
    createdAt: "2025-12-15T00:00:00.000Z",
    updatedAt: "2025-12-15T00:00:00.000Z",
  };

  const stages: Stage[] = [
    {
      id: "stage1",
      title: "Phase 1: MVP",
      subtitle: "Web3 Receipt Automation",
      description:
        "Transform on-chain transactions into professional receipts with automatic QuickBooks integration. Solve the critical problem of blockchain transaction hashes not being recognized by traditional accounting systems.",
      features: [
        "Instant receipt generation from blockchain transactions",
        "NFT-based receipt verification and storage",
        "Professional PDF and JSON export formats",
        "Seamless QuickBooks Online integration",
        "Complete audit trail on blockchain",
        "Real-time transaction monitoring and alerts",
      ],
      status: "active",
      timeline: "Q3 2025",
      workflow: [
        {
          id: "tx1",
          title: "Blockchain Transaction",
          description: "User completes payment on blockchain",
          icon: <CreditCard className="h-5 w-5" />,
          status: "completed",
        },
        {
          id: "receipt1",
          title: "Smart Receipt Creation",
          description: "AI-powered receipt generation",
          icon: <Receipt className="h-5 w-5" />,
          status: "completed",
        },
        {
          id: "nft1",
          title: "NFT Receipt Minting",
          description: "Create immutable receipt on blockchain",
          icon: <FileText className="h-5 w-5" />,
          status: "completed",
        },
        {
          id: "export1",
          title: "Multi-Format Export",
          description: "Download as PDF, JSON, or CSV",
          icon: <Download className="h-5 w-5" />,
          status: "completed",
        },
        {
          id: "quickbooks1",
          title: "QuickBooks Sync",
          description: "Automatic accounting entry creation",
          icon: <Upload className="h-5 w-5" />,
          status: "current",
        },
      ],
    },
    {
      id: "stage2",
      title: "Phase 2: Enhanced",
      subtitle: "Enterprise Expense Management",
      description:
        "Build a complete Web3-native expense management system that replaces traditional tools like Discord and Google Sheets. Features multi-signature approvals, comprehensive audit trails, and automated QuickBooks integration.",
      features: [
        "Streamlined expense submission portal",
        "Multi-level approval workflows with digital signatures",
        "Complete blockchain audit trail",
        "Automated expense voucher generation",
        "Direct QuickBooks journal entry creation",
        "Enterprise-grade security and compliance",
      ],
      status: "planned",
      timeline: "Q4 2025",
      workflow: [
        {
          id: "request",
          title: "Expense Submission",
          description: "Employee submits expense with receipts",
          icon: <FileSpreadsheet className="h-5 w-5" />,
          status: "pending",
        },
        {
          id: "approval",
          title: "Multi-Signature Review",
          description: "Department heads and managers approve",
          icon: <UserCheck className="h-5 w-5" />,
          status: "pending",
        },
        {
          id: "payment",
          title: "Blockchain Payment",
          description: "Automated payment execution on-chain",
          icon: <CreditCard className="h-5 w-5" />,
          status: "pending",
        },
        {
          id: "receipt2",
          title: "Voucher Creation",
          description: "Generate official expense vouchers",
          icon: <Receipt className="h-5 w-5" />,
          status: "pending",
        },
        {
          id: "reimbursement",
          title: "Accounting Integration",
          description: "Sync with QuickBooks automatically",
          icon: <CheckSquare className="h-5 w-5" />,
          status: "pending",
        },
      ],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "planned":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "In Progress";
      case "planned":
        return "Planned";
      case "completed":
        return "Completed";
      default:
        return "Unknown";
    }
  };

  // Real Components for each step
  const TransactionDemo = () => (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="font-semibold text-gray-900 mb-3">Transaction Demo</h4>
      {/* Use the real SplitBillDetail component */}
      <div className="w-full">
        <SplitBillDetail
          bill={mockBill}
          onError={(error) => console.log("Error:", error)}
          onSuccess={(message) => console.log("Success:", message)}
        />
      </div>
    </div>
  );

  const ReceiptDemo = () => (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="font-semibold text-gray-900 mb-3">Receipt Demo</h4>
      {/* Use the real ReceiptDetail component */}
      <div className="w-full">
        <ReceiptDetail bill={mockBill} isWalletConnected={true} />
      </div>
    </div>
  );

  const NFTDemo = () => {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-3">NFT Receipt Demo</h4>
        {/* Use the real NFTDetail component */}
        <div className="w-full">
          <NFTDetail nft={mockNFT} showHeader={false} compact={true} />
        </div>
      </div>
    );
  };

  const ExportDemo = () => (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="font-semibold text-gray-900 mb-3">Export Options Demo</h4>
      <div className="space-y-3">
        <div className="bg-white p-3 rounded border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-red-500" />
              <span className="font-medium">PDF Export</span>
            </div>
            <Badge variant="outline" className="text-xs">
              Download
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Professional PDF format with company branding and digital signature
          </p>
        </div>
        <div className="bg-white p-3 rounded border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <span className="font-medium">JSON Export</span>
            </div>
            <Badge variant="outline" className="text-xs">
              Download
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Structured data format for API integration and data analysis
          </p>
        </div>
        <div className="bg-white p-3 rounded border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-green-500" />
              <span className="font-medium">CSV Export</span>
            </div>
            <Badge variant="outline" className="text-xs">
              Download
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Spreadsheet format for accounting and financial reporting
          </p>
        </div>
      </div>
    </div>
  );

  const QuickBooksDemo = () => (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="font-semibold text-gray-900 mb-3">
        QuickBooks Integration Demo
      </h4>
      <div className="bg-white p-4 rounded border">
        <div className="mb-3">
          <div className="flex items-center space-x-2 mb-2">
            <Database className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-600">Sync Successful</span>
          </div>
          <div className="text-sm text-gray-600">
            Receipt data automatically synced to QuickBooks Online
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Journal Entry Created:</span>
            <span className="font-medium">Yes</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Account:</span>
            <span>Meals & Entertainment</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Amount:</span>
            <span>${mockBill.totalAmount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Date:</span>
            <span>{mockBill.createdAt.toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Reference:</span>
            <span className="font-mono text-xs">NFT-001</span>
          </div>
        </div>
        <div className="mt-3 p-2 bg-green-50 rounded text-xs text-green-700">
          <div className="font-medium">Benefits:</div>
          <div>• Automatic categorization</div>
          <div>• Real-time sync</div>
          <div>• Audit trail maintained</div>
          <div>• Tax compliance ready</div>
        </div>
      </div>
    </div>
  );

  // Phase 2 Demo Components
  const ExpenseSubmissionDemo = () => (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="font-semibold text-gray-900 mb-3">
        Expense Submission Demo
      </h4>
      <div className="bg-white p-4 rounded border">
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-3">
            <FileSpreadsheet className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-600">
              New Expense Request
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Employee submits expense with digital receipts and documentation
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
            <span className="text-sm text-gray-600">Employee:</span>
            <span className="font-medium">alice.base.eth</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
            <span className="text-sm text-gray-600">Department:</span>
            <span className="font-medium">Engineering</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
            <span className="text-sm text-gray-600">Amount:</span>
            <span className="font-medium">$245.67</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
            <span className="text-sm text-gray-600">Category:</span>
            <span className="font-medium">Travel & Meals</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
            <span className="text-sm text-gray-600">Receipts:</span>
            <span className="font-medium">3 attached</span>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-100 rounded text-xs text-blue-800">
          <div className="font-medium">Features:</div>
          <div>• Digital receipt upload</div>
          <div>• Automatic categorization</div>
          <div>• Policy compliance check</div>
          <div>• Real-time validation</div>
        </div>
      </div>
    </div>
  );

  const MultiSignatureDemo = () => (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="font-semibold text-gray-900 mb-3">
        Multi-Signature Review Demo
      </h4>
      <div className="bg-white p-4 rounded border">
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-3">
            <UserCheck className="h-5 w-5 text-purple-600" />
            <span className="font-medium text-purple-600">
              Approval Workflow
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Multi-level approval process with digital signatures
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">Team Lead</span>
            </div>
            <span className="text-xs text-green-600">✓ Approved</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">Department Manager</span>
            </div>
            <span className="text-xs text-green-600">✓ Approved</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm font-medium">Finance Team</span>
            </div>
            <span className="text-xs text-yellow-600">⏳ Pending</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span className="text-sm font-medium">CFO</span>
            </div>
            <span className="text-xs text-gray-500">Waiting</span>
          </div>
        </div>
        <div className="mt-4 p-3 bg-purple-100 rounded text-xs text-purple-800">
          <div className="font-medium">Security Features:</div>
          <div>• Digital signature verification</div>
          <div>• Blockchain audit trail</div>
          <div>• Role-based permissions</div>
          <div>• Real-time status tracking</div>
        </div>
      </div>
    </div>
  );

  const BlockchainPaymentDemo = () => (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="font-semibold text-gray-900 mb-3">
        Blockchain Payment Demo
      </h4>
      <div className="bg-white p-4 rounded border">
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-3">
            <CreditCard className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-600">
              Payment Execution
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Automated payment execution on Base network with USDC
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-green-50 rounded">
            <span className="text-sm text-gray-600">Transaction Hash:</span>
            <span className="font-mono text-xs">0x7a8b...9c2d</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-green-50 rounded">
            <span className="text-sm text-gray-600">Amount:</span>
            <span className="font-medium">245.67 USDC</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-green-50 rounded">
            <span className="text-sm text-gray-600">Recipient:</span>
            <span className="font-medium">bob.base.eth</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-green-50 rounded">
            <span className="text-sm text-gray-600">Network:</span>
            <span className="font-medium">Base L2</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-green-50 rounded">
            <span className="text-sm text-gray-600">Gas Fee:</span>
            <span className="font-medium">$0.12</span>
          </div>
        </div>
        <div className="mt-4 p-3 bg-green-100 rounded text-xs text-green-800">
          <div className="font-medium">Blockchain Benefits:</div>
          <div>• Instant settlement</div>
          <div>• Transparent transaction</div>
          <div>• Immutable record</div>
          <div>• Low gas fees</div>
        </div>
      </div>
    </div>
  );

  const VoucherCreationDemo = () => (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="font-semibold text-gray-900 mb-3">
        Voucher Creation Demo
      </h4>
      <div className="bg-white p-4 rounded border">
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-3">
            <Receipt className="h-5 w-5 text-orange-600" />
            <span className="font-medium text-orange-600">
              Official Voucher
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Generate official expense vouchers with company branding
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
            <span className="text-sm text-gray-600">Voucher ID:</span>
            <span className="font-medium">V-2025-001</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
            <span className="text-sm text-gray-600">Company:</span>
            <span className="font-medium">SplitBase Inc.</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
            <span className="text-sm text-gray-600">Date:</span>
            <span className="font-medium">Dec 15, 2025</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
            <span className="text-sm text-gray-600">Total Amount:</span>
            <span className="font-medium">$245.67</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
            <span className="text-sm text-gray-600">Status:</span>
            <span className="font-medium text-green-600">✓ Generated</span>
          </div>
        </div>
        <div className="mt-4 p-3 bg-orange-100 rounded text-xs text-orange-800">
          <div className="font-medium">Voucher Features:</div>
          <div>• Company branding</div>
          <div>• Digital signature</div>
          <div>• QR code verification</div>
          <div>• Blockchain timestamp</div>
        </div>
      </div>
    </div>
  );

  const AccountingIntegrationDemo = () => (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="font-semibold text-gray-900 mb-3">
        Accounting Integration Demo
      </h4>
      <div className="bg-white p-4 rounded border">
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-3">
            <CheckSquare className="h-5 w-5 text-indigo-600" />
            <span className="font-medium text-indigo-600">QuickBooks Sync</span>
          </div>
          <div className="text-sm text-gray-600">
            Automatic accounting entry creation and synchronization
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-indigo-50 rounded">
            <span className="text-sm text-gray-600">Journal Entry:</span>
            <span className="font-medium">JE-2025-001</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-indigo-50 rounded">
            <span className="text-sm text-gray-600">Account:</span>
            <span className="font-medium">Travel & Entertainment</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-indigo-50 rounded">
            <span className="text-sm text-gray-600">Amount:</span>
            <span className="font-medium">$245.67</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-indigo-50 rounded">
            <span className="text-sm text-gray-600">Sync Status:</span>
            <span className="font-medium text-green-600">✓ Synced</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-indigo-50 rounded">
            <span className="text-sm text-gray-600">Last Sync:</span>
            <span className="font-medium">2 minutes ago</span>
          </div>
        </div>
        <div className="mt-4 p-3 bg-indigo-100 rounded text-xs text-indigo-800">
          <div className="font-medium">Integration Benefits:</div>
          <div>• Real-time sync</div>
          <div>• Automatic categorization</div>
          <div>• Audit trail</div>
          <div>• Tax compliance</div>
        </div>
      </div>
    </div>
  );

  const renderStepDemo = (stepId: string) => {
    switch (stepId) {
      // Phase 1 demos
      case "tx1":
        return <TransactionDemo />;
      case "receipt1":
        return <ReceiptDemo />;
      case "nft1":
        return <NFTDemo />;
      case "export1":
        return <ExportDemo />;
      case "quickbooks1":
        return <QuickBooksDemo />;
      // Phase 2 demos
      case "request":
        return <ExpenseSubmissionDemo />;
      case "approval":
        return <MultiSignatureDemo />;
      case "payment":
        return <BlockchainPaymentDemo />;
      case "receipt2":
        return <VoucherCreationDemo />;
      case "reimbursement":
        return <AccountingIntegrationDemo />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <AnimatedGradientText
            className="text-4xl md:text-6xl font-black tracking-tight"
            speed={2}
            colorFrom="#a8c44a"
            colorTo="#6ba83a"
          >
            Product Roadmap
          </AnimatedGradientText>
          <div className="text-xl md:text-2xl text-neutral-600 font-medium">
            <AuroraText
              className="font-bold"
              colors={["#a8c44a", "#6ba83a", "#4a7a3a", "#8ba63a"]}
            >
              Web3 Financial Infrastructure
            </AuroraText>{" "}
            Development Plan
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
            <Zap className="w-4 h-4 mr-2" />
            Blockchain Receipts
          </Badge>
          <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
            <Database className="w-4 h-4 mr-2" />
            QuickBooks Sync
          </Badge>
          <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
            <Workflow className="w-4 h-4 mr-2" />
            Multi-Signature Approvals
          </Badge>
        </div>
      </div>

      {/* Stage Navigation */}
      <div className="flex justify-center">
        <div className="flex bg-white/60 backdrop-blur-sm rounded-full p-1 shadow-sm ring-1 ring-black/5">
          {stages.map((stage) => (
            <button
              key={stage.id}
              onClick={() => setActiveStage(stage.id)}
              className={`px-6 py-2.5 rounded-full font-semibold transition-all duration-200 ${
                activeStage === stage.id
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md ring-1 ring-emerald-500/40"
                  : "text-gray-700 hover:text-gray-900 hover:bg-white/70"
              }`}
            >
              {stage.title}
            </button>
          ))}
        </div>
      </div>

      {/* Active Stage Content */}
      {stages.map((stage) => (
        <div
          key={stage.id}
          className={activeStage === stage.id ? "block" : "hidden"}
        >
          <div className="space-y-8">
            {/* Stage Overview */}
            <NeonGradientCard>
              <CardHeader className="text-center">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <Badge
                    className={`px-3 py-1 text-sm font-medium border ${getStatusColor(stage.status)}`}
                  >
                    {getStatusText(stage.status)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="px-3 py-1 text-sm font-medium"
                  >
                    {stage.timeline}
                  </Badge>
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900">
                  {stage.title}
                </CardTitle>
                <div className="text-xl font-semibold text-gray-700 mt-2">
                  {stage.subtitle}
                </div>
                <p className="text-gray-600 mt-4 max-w-3xl mx-auto leading-relaxed">
                  {stage.description}
                </p>
              </CardHeader>
            </NeonGradientCard>

            {/* Workflow Visualization */}
            {stage.workflow && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Process Flow
                  </h3>
                  <p className="text-gray-600">
                    Click on each step to see detailed demo and workflow
                  </p>
                </div>

                <div className="space-y-4">
                  {stage.workflow.map((step, index) => (
                    <div key={step.id} className="relative">
                      {/* Step Card */}
                      <Card
                        className={`hover:shadow-lg transition-all duration-200 cursor-pointer ${
                          step.status === "completed"
                            ? "ring-2 ring-green-200 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100"
                            : step.status === "current"
                              ? "ring-2 ring-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100"
                              : step.status === "pending" &&
                                  step.id === "request"
                                ? "ring-2 ring-blue-200 bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-100"
                                : step.status === "pending" &&
                                    step.id === "approval"
                                  ? "ring-2 ring-purple-200 bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-100"
                                  : step.status === "pending" &&
                                      step.id === "payment"
                                    ? "ring-2 ring-green-200 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100"
                                    : step.status === "pending" &&
                                        step.id === "receipt2"
                                      ? "ring-2 ring-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100"
                                      : step.status === "pending" &&
                                          step.id === "reimbursement"
                                        ? "ring-2 ring-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100"
                                        : "ring-1 ring-gray-200 bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-100"
                        }`}
                        onClick={() => toggleStepExpansion(step.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div
                                className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${
                                  step.status === "completed"
                                    ? "bg-green-100 border-green-300 text-green-700"
                                    : step.status === "current"
                                      ? "bg-blue-100 border-blue-300 text-blue-700"
                                      : step.status === "pending" &&
                                          step.id === "request"
                                        ? "bg-blue-100 border-blue-300 text-blue-700"
                                        : step.status === "pending" &&
                                            step.id === "approval"
                                          ? "bg-purple-100 border-purple-300 text-purple-700"
                                          : step.status === "pending" &&
                                              step.id === "payment"
                                            ? "bg-green-100 border-green-300 text-green-700"
                                            : step.status === "pending" &&
                                                step.id === "receipt2"
                                              ? "bg-orange-100 border-orange-300 text-orange-700"
                                              : step.status === "pending" &&
                                                  step.id === "reimbursement"
                                                ? "bg-indigo-100 border-indigo-300 text-indigo-700"
                                                : "bg-gray-100 border-gray-300 text-gray-600"
                                }`}
                              >
                                {step.icon}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-1">
                                  {step.title}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {step.description}
                                </p>
                                <Badge
                                  className={`text-xs px-2 py-1 mt-2 ${
                                    step.status === "completed"
                                      ? "bg-green-100 text-green-700 border-green-200"
                                      : step.status === "current"
                                        ? "bg-blue-100 text-blue-700 border-blue-200"
                                        : step.status === "pending" &&
                                            step.id === "request"
                                          ? "bg-blue-100 text-blue-700 border-blue-200"
                                          : step.status === "pending" &&
                                              step.id === "approval"
                                            ? "bg-purple-100 text-purple-700 border-purple-200"
                                            : step.status === "pending" &&
                                                step.id === "payment"
                                              ? "bg-green-100 text-green-700 border-green-200"
                                              : step.status === "pending" &&
                                                  step.id === "receipt2"
                                                ? "bg-orange-100 text-orange-700 border-orange-200"
                                                : step.status === "pending" &&
                                                    step.id === "reimbursement"
                                                  ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                                                  : "bg-gray-100 text-gray-500 border-gray-200"
                                  }`}
                                >
                                  {step.status === "completed"
                                    ? "Completed"
                                    : step.status === "current"
                                      ? "In Progress"
                                      : "Pending"}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {expandedSteps.has(step.id) ? (
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                              ) : (
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Expanded Demo Content */}
                      {expandedSteps.has(step.id) && (
                        <div className="mt-2">{renderStepDemo(step.id)}</div>
                      )}

                      {/* Arrow (Desktop) */}
                      {stage.workflow && index < stage.workflow.length - 1 && (
                        <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                          <ArrowRight className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
