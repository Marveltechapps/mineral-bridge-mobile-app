import React from 'react';
import { AuthDoneScreen } from '../screens/auth/AuthDoneScreen';
import { IntroScreen } from '../screens/auth/IntroScreen';
import { OtpScreen } from '../screens/auth/OtpScreen';
import { PhoneEntryScreen } from '../screens/auth/PhoneEntryScreen';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { TierScreen } from '../screens/auth/TierScreen';
import { VerifyingScreen } from '../screens/auth/VerifyingScreen';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { AuctionDetailScreen } from '../screens/auctions/AuctionDetailScreen';
import { AuctionListScreen } from '../screens/auctions/AuctionListScreen';
import {
  AuctionLostScreen,
  AuctionWonScreen,
} from '../screens/auctions/AuctionResultScreens';
import { BuyerHomeScreen } from '../screens/buyer/BuyerHomeScreen';
import { CartScreen } from '../screens/buyer/CartScreen';
import { DeliveryScreen } from '../screens/buyer/DeliveryScreen';
import { MineralDetailScreen } from '../screens/buyer/MineralDetailScreen';
import { OrderDoneScreen } from '../screens/buyer/OrderDoneScreen';
import { ProductGridScreen } from '../screens/buyer/ProductGridScreen';
import { QuantityScreen } from '../screens/buyer/QuantityScreen';
import { ReviewRequestScreen } from '../screens/buyer/ReviewRequestScreen';
import { TypeListScreen } from '../screens/buyer/TypeListScreen';
import { KycDocScreen } from '../screens/kyc/KycDocScreen';
import { KycIdScreen } from '../screens/kyc/KycIdScreen';
import { KycPendingScreen } from '../screens/kyc/KycPendingScreen';
import { KycReviewScreen } from '../screens/kyc/KycReviewScreen';
import { KycSelfieScreen } from '../screens/kyc/KycSelfieScreen';
import { KycStartScreen } from '../screens/kyc/KycStartScreen';
import { LearnHomeScreen } from '../screens/learn/LearnHomeScreen';
import { LessonListScreen } from '../screens/learn/LessonListScreen';
import { LessonPlayerScreen } from '../screens/learn/LessonPlayerScreen';
import { ChatScreen } from '../screens/profile/ChatScreen';
import {
  DocumentDetailScreen,
  DocumentsScreen,
} from '../screens/profile/DocumentScreens';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { NotificationsScreen } from '../screens/profile/NotificationsScreen';
import {
  PayoutScreen,
  WithdrawScreen,
} from '../screens/profile/PayoutScreens';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { SettingsScreen } from '../screens/profile/SettingsScreen';
import { SupportScreen } from '../screens/profile/SupportScreen';
import {
  NewTicketScreen,
  TicketScreen,
} from '../screens/profile/TicketScreens';
import { BulkDoneScreen } from '../screens/sell/BulkDoneScreen';
import { BulkReviewScreen } from '../screens/sell/BulkReviewScreen';
import { BulkStep1Screen } from '../screens/sell/BulkStep1Screen';
import { BulkStep2Screen } from '../screens/sell/BulkStep2Screen';
import { EstimateScreen } from '../screens/sell/EstimateScreen';
import { EvaluationScreen } from '../screens/sell/EvaluationScreen';
import { OfferScreen } from '../screens/sell/OfferScreen';
import { PaidScreen } from '../screens/sell/PaidScreen';
import { PickupScreen } from '../screens/sell/PickupScreen';
import { SellDoneScreen } from '../screens/sell/SellDoneScreen';
import { SellListScreen } from '../screens/sell/SellListScreen';
import { SellPickScreen } from '../screens/sell/SellPickScreen';
import { SellReviewScreen } from '../screens/sell/SellReviewScreen';
import { OrdersScreen } from '../screens/tracking/OrdersScreen';
import { TrackOrderScreen } from '../screens/tracking/TrackOrderScreen';
import { TrackSellRequestScreen } from '../screens/tracking/TrackSellRequestScreen';
import type { ScreenId } from './types';

const SignupPhoneScreen = () => <PhoneEntryScreen mode="signupPhone" />;
const LoginScreen = () => <PhoneEntryScreen mode="login" />;

/** Screen id → component. */
export const SCREENS: Record<ScreenId, React.ComponentType> = {
  splash: SplashScreen,
  welcome: WelcomeScreen,
  signupPhone: SignupPhoneScreen,
  login: LoginScreen,
  otp: OtpScreen,
  verifying: VerifyingScreen,
  authDone: AuthDoneScreen,
  intro: IntroScreen,
  tier: TierScreen,
  kycStart: KycStartScreen,
  kycId: KycIdScreen,
  kycDoc: KycDocScreen,
  kycSelfie: KycSelfieScreen,
  kycReview: KycReviewScreen,
  kycPending: KycPendingScreen,
  orders: OrdersScreen,
  track: TrackOrderScreen,
  sTrack: TrackSellRequestScreen,
  bHome: BuyerHomeScreen,
  bTypes: TypeListScreen,
  bProducts: ProductGridScreen,
  bDetail: MineralDetailScreen,
  bQty: QuantityScreen,
  bDeliv: DeliveryScreen,
  bReview: ReviewRequestScreen,
  bDone: OrderDoneScreen,
  cart: CartScreen,
  sPick: SellPickScreen,
  qList: SellListScreen,
  sEstimate: EstimateScreen,
  qPickup: PickupScreen,
  qReview: SellReviewScreen,
  qDone: SellDoneScreen,
  sEval: EvaluationScreen,
  sOffer: OfferScreen,
  sPaid: PaidScreen,
  iStep1: BulkStep1Screen,
  iStep2: BulkStep2Screen,
  iReview: BulkReviewScreen,
  iDone: BulkDoneScreen,
  aList: AuctionListScreen,
  aDetail: AuctionDetailScreen,
  aWon: AuctionWonScreen,
  aLost: AuctionLostScreen,
  lHome: LearnHomeScreen,
  lList: LessonListScreen,
  lPlayer: LessonPlayerScreen,
  profile: ProfileScreen,
  editProfile: EditProfileScreen,
  support: SupportScreen,
  chat: ChatScreen,
  ticket: TicketScreen,
  newTicket: NewTicketScreen,
  notifs: NotificationsScreen,
  payout: PayoutScreen,
  withdraw: WithdrawScreen,
  docs: DocumentsScreen,
  docDetail: DocumentDetailScreen,
  settings: SettingsScreen,
};
