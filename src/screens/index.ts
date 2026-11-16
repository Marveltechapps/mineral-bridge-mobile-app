import type React from 'react';
import type { AppScreen } from '../navigation/types';
import type { ScreenProps } from './types';
import { WelcomeScreen } from './onboarding/WelcomeScreen';
import { AuthScreen } from './onboarding/AuthScreen';
import { OtpScreen } from './onboarding/OtpScreen';
import { AccountTypeScreen } from './onboarding/AccountTypeScreen';
import { RegDetailsScreen } from './onboarding/RegDetailsScreen';
import { KycScreen } from './onboarding/KycScreen';
import { KycDocScreen } from './onboarding/KycDocScreen';
import { KycDoneScreen } from './onboarding/KycDoneScreen';
import { DashboardScreen } from './dashboard/DashboardScreen';
import { CategoriesScreen } from './buy/CategoriesScreen';
import { MineralsScreen } from './buy/MineralsScreen';
import { LotsScreen } from './buy/LotsScreen';
import { ProductDetailScreen } from './buy/ProductDetailScreen';
import { CartScreen } from './buy/CartScreen';
import { CheckoutScreen } from './buy/CheckoutScreen';
import { OrderPlacedScreen } from './buy/OrderPlacedScreen';
import { OrdersScreen } from './orders/OrdersScreen';
import { OrderTrackingScreen } from './orders/OrderTrackingScreen';
import { QuoteScreen } from './orders/QuoteScreen';
import { ContractScreen } from './orders/ContractScreen';
import { PayDetailsScreen } from './orders/PayDetailsScreen';
import { ReportScreen } from './orders/ReportScreen';
import { PaymentScreen } from './orders/PaymentScreen';
import { ReceiptScreen } from './orders/ReceiptScreen';
import { ChatScreen } from './orders/ChatScreen';
import { ShipmentScreen } from './orders/ShipmentScreen';
import { CancelScreen } from './orders/CancelScreen';
import { RefundScreen } from './orders/RefundScreen';
import { RefundsScreen } from './orders/RefundsScreen';
import { DocumentScreen } from './orders/DocumentScreen';
import { SellCategoriesScreen } from './sell/SellCategoriesScreen';
import { SellFormScreen } from './sell/SellFormScreen';
import { SellDoneScreen } from './sell/SellDoneScreen';
import { SellerConfirmScreen } from './sell/SellerConfirmScreen';
import { AuctionsScreen } from './auctions/AuctionsScreen';
import { AuctionScreen } from './auctions/AuctionScreen';
import { AuctionWonScreen } from './auctions/AuctionWonScreen';
import { ProfileScreen } from './account/ProfileScreen';
import { EditProfileScreen } from './account/EditProfileScreen';
import { KycStatusScreen } from './account/KycStatusScreen';
import { NotificationsScreen } from './account/NotificationsScreen';
import { PrefsScreen } from './account/PrefsScreen';
import { HelpScreen } from './account/HelpScreen';

export const SCREENS: Record<AppScreen, React.ComponentType<ScreenProps>> = {
  welcome: WelcomeScreen, auth: AuthScreen, otp: OtpScreen, regType: AccountTypeScreen, regDetails: RegDetailsScreen, kyc: KycScreen, kycDoc: KycDocScreen, kycDone: KycDoneScreen,
  home: DashboardScreen, cats: CategoriesScreen, minerals: MineralsScreen, lots: LotsScreen, detail: ProductDetailScreen, cart: CartScreen, checkout: CheckoutScreen, placed: OrderPlacedScreen,
  orders: OrdersScreen, order: OrderTrackingScreen, quote: QuoteScreen, contract: ContractScreen, payInsp: PayDetailsScreen, sellConfirm: SellerConfirmScreen, report: ReportScreen, pay: PaymentScreen,
  refund: RefundScreen, cancel: CancelScreen, refunds: RefundsScreen, receipt: ReceiptScreen, chat: ChatScreen, shipment: ShipmentScreen,
  sellCats: SellCategoriesScreen, sellForm: SellFormScreen, sellDone: SellDoneScreen,
  profile: ProfileScreen, editProfile: EditProfileScreen, bizType: AccountTypeScreen, kycStatus: KycStatusScreen, notifs: NotificationsScreen, prefs: PrefsScreen, help: HelpScreen,
  auctions: AuctionsScreen, auction: AuctionScreen, auctionWon: AuctionWonScreen, doc: DocumentScreen,
};
