// ---------------------------------------------------------------------------
// Shared request/response types — mirrors backend/app/schemas/*.py exactly.
// Keep field names in sync with the Pydantic models; this file is the single
// contract both the admin and client apps import.
// ---------------------------------------------------------------------------

export type AccountType = "traveler" | "partner" | "admin";
export type AccountStatus =
  | "pending"
  | "active"
  | "invited"
  | "inactive"
  | "suspended"
  | "deleted";
export type PermissionModule =
  | "dashboard"
  | "properties"
  | "bookings"
  | "guests"
  | "modules"
  | "cms"
  | "blog"
  | "contact"
  | "reports"
  | "payments"
  | "settings"
  | "roles"
  | "stays";
export type PermissionAction = "view" | "create" | "edit" | "delete";

// ---- Health ----------------------------------------------------------------

export interface HealthResponse {
  status: "ok";
  service: string;
  version: string;
}

// ---- Auth --------------------------------------------------------------

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleAuthRequest {
  access_token: string;
}

export interface FacebookAuthRequest {
  access_token: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  account_type?: "traveler" | "partner";
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AuthResponse extends TokenPair {
  user: UserOut;
  /** Dev-only: populated until email delivery is wired up. */
  verification_token?: string | null;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface LogoutRequest {
  refresh_token: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetRequestOut {
  message: string;
  /** Dev-only: populated until email delivery is wired up. */
  reset_token?: string | null;
}

export interface ConfirmResetRequest {
  token: string;
  new_password: string;
}

export interface MessageResponse {
  message: string;
}

// ---- Users ---------------------------------------------------------------

export interface UserOut {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  display_name?: string | null;
  phone?: string | null;
  account_type: AccountType;
  status: AccountStatus;
  email_verified_at?: string | null;
  preferred_currency: string;
  preferred_language: string;
  timezone: string;
  country?: string | null;
  city?: string | null;
  last_login_at?: string | null;
  created_at: string;
  updated_at: string;
  roles: string[];
}

export interface UserCreate {
  email: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "prefer_not_to_say";
  account_type?: AccountType;
  status?: AccountStatus;
  preferred_currency?: string;
  preferred_language?: string;
  timezone?: string;
  country?: string;
  city?: string;
  address?: string;
  zip_code?: string;
  role_ids?: string[];
}

export interface UserUpdate {
  password?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "prefer_not_to_say";
  status?: AccountStatus;
  preferred_currency?: string;
  preferred_language?: string;
  timezone?: string;
  country?: string;
  city?: string;
  address?: string;
  zip_code?: string;
}

export interface UserRolesUpdate {
  role_ids: string[];
}

export interface ProfileUpdate {
  first_name?: string;
  last_name?: string;
  display_name?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "prefer_not_to_say";
  country?: string;
  city?: string;
  address?: string;
  zip_code?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface PreferencesUpdate {
  preferred_currency?: string;
  preferred_language?: string;
  timezone?: string;
}

export interface UserListParams {
  [key: string]: string | number | boolean | undefined;
  account_type?: AccountType;
  status?: AccountStatus;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface UserSessionOut {
  id: string;
  user_id: string;
  device_type: string;
  device_name?: string | null;
  browser?: string | null;
  os?: string | null;
  ip_address?: string | null;
  location?: string | null;
  is_active: boolean;
  last_activity_at: string;
  expires_at: string;
  created_at: string;
}

export interface UserActivityLogOut {
  id: string;
  user_id?: string | null;
  session_id?: string | null;
  action: string;
  resource_type?: string | null;
  resource_id?: string | null;
  details?: unknown;
  ip_address?: string | null;
  created_at: string;
}

// ---- Roles / permissions --------------------------------------------------

export interface RoleOut {
  id: string;
  name: string;
  display_name: string;
  description?: string | null;
  level: number;
  is_system: boolean;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface RoleCreate {
  name: string;
  display_name: string;
  description?: string;
  level?: number;
  is_system?: boolean;
  status?: "active" | "inactive";
}

export interface RoleUpdate {
  display_name?: string;
  description?: string;
  level?: number;
  status?: "active" | "inactive";
}

export interface PermissionOut {
  id: string;
  name: string;
  resource: PermissionModule;
  action: PermissionAction;
  description?: string | null;
}

export interface RolePermissionInput {
  module: PermissionModule;
  action: PermissionAction;
}

export interface RolePermissionsUpdate {
  permissions: RolePermissionInput[];
}

// ---- Partner / traveler profiles ------------------------------------------

export interface PartnerProfileOut {
  id: string;
  user_id: string;
  business_name: string;
  business_registration_number?: string | null;
  tax_id?: string | null;
  business_license_url?: string | null;
  logo_url?: string | null;
  website?: string | null;
  business_phone?: string | null;
  business_email?: string | null;
  business_address?: string | null;
  business_city?: string | null;
  business_country?: string | null;
  is_verified: boolean;
  verification_documents?: unknown;
  verification_notes?: string | null;
  verified_by?: string | null;
  verified_at?: string | null;
  commission_rate: number;
  payment_terms: "weekly" | "biweekly" | "monthly";
  auto_confirm_bookings: boolean;
  max_cancellation_days: number;
  status: "pending" | "active" | "suspended" | "terminated" | "rejected";
  created_at: string;
  updated_at: string;
}

export interface PartnerProfileUpdate {
  business_name?: string;
  business_registration_number?: string;
  tax_id?: string;
  business_license_url?: string;
  logo_url?: string;
  website?: string;
  business_phone?: string;
  business_email?: string;
  business_address?: string;
  business_city?: string;
  business_country?: string;
  is_verified?: boolean;
  verification_documents?: unknown;
  verification_notes?: string;
  verified_by?: string;
  verified_at?: string;
  commission_rate?: number;
  payment_terms?: "weekly" | "biweekly" | "monthly";
  auto_confirm_bookings?: boolean;
  max_cancellation_days?: number;
  status?: "pending" | "active" | "suspended" | "terminated" | "rejected";
}

export interface PartnerProfileSelfUpdate {
  business_name?: string;
  business_registration_number?: string;
  tax_id?: string;
  business_license_url?: string;
  logo_url?: string;
  website?: string;
  business_phone?: string;
  business_email?: string;
  business_address?: string;
  business_city?: string;
  business_country?: string;
  auto_confirm_bookings?: boolean;
  max_cancellation_days?: number;
}

export interface PartnerSummaryOut {
  user_id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  account_status: AccountStatus;
  partner_profile_id?: string | null;
  business_name?: string | null;
  is_verified?: boolean | null;
  verification_status?: string | null;
  created_at: string;
}

export interface PartnerListParams {
  [key: string]: string | number | boolean | undefined;
  verified?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface TravelerProfileOut {
  id: string;
  user_id: string;
  loyalty_points: number;
  loyalty_tier: "bronze" | "silver" | "gold" | "platinum";
  total_bookings: number;
  total_spent: number;
  preferred_room_type?: string | null;
  preferred_meal_plan?: string | null;
  passport_number?: string | null;
  passport_expiry?: string | null;
  nationality?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  preferred_airlines?: unknown;
  preferred_hotels?: unknown;
  special_requests?: string | null;
  newsletter_subscribed: boolean;
  marketing_consent_given: boolean;
  marketing_consent_given_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TravelerProfileUpdate {
  preferred_room_type?: string;
  preferred_meal_plan?: string;
  passport_number?: string;
  passport_expiry?: string;
  nationality?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  preferred_airlines?: unknown;
  preferred_hotels?: unknown;
  special_requests?: string;
  newsletter_subscribed?: boolean;
  marketing_consent_given?: boolean;
  marketing_consent_given_at?: string;
}

// ---- Payment gateways (admin) -------------------------------------------

export type PaymentGatewayStatus = "active" | "test" | "inactive";

export interface PaymentGatewayCredentialsInput {
  public_key?: string;
  secret_key?: string;
  merchant_id?: string;
  webhook_secret?: string;
}

export interface PaymentGatewayCredentialsOut {
  public_key?: string | null;
  merchant_id?: string | null;
  /** Masked, e.g. "••••1234" — the raw secret is never returned. */
  secret_key_preview?: string | null;
  webhook_secret_preview?: string | null;
}

export interface PaymentGatewayOut {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  status: PaymentGatewayStatus;
  is_default: boolean;
  currencies: string[];
  credentials: PaymentGatewayCredentialsOut;
  success_url?: string | null;
  cancel_url?: string | null;
  webhook_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentGatewayCreate {
  code: string;
  name: string;
  description?: string;
  status?: PaymentGatewayStatus;
  is_default?: boolean;
  currencies?: string[];
  credentials?: PaymentGatewayCredentialsInput;
  success_url?: string;
  cancel_url?: string;
  webhook_url?: string;
}

export interface PaymentGatewayUpdate {
  name?: string;
  description?: string;
  status?: PaymentGatewayStatus;
  currencies?: string[];
  credentials?: PaymentGatewayCredentialsInput;
  success_url?: string;
  cancel_url?: string;
  webhook_url?: string;
}

// ---- Third-party modules (admin) ----------------------------------------

export type ModuleStatus = "active" | "inactive";
export type ModuleEnvironment = "development" | "staging" | "production";
export type MarkupType = "percentage" | "flat";
export type TaxType = "percentage" | "flat";

export interface MarkupRule {
  type: MarkupType;
  value: number;
}

export interface ModuleTaxConfig {
  type: TaxType;
  value: number;
}

export interface ThirdPartyCredentialFieldOut {
  key: string;
  label: string;
  secret: boolean;
  required: boolean;
  /** Masked for secret fields (e.g. "••••1234"), plain otherwise. `null` if unset. */
  value: string | null;
}

export interface ThirdPartyModuleOut {
  id: string;
  provider: string;
  module_id: string;
  name: string;
  category: string;
  status: ModuleStatus;
  ai_enabled: boolean;
  environment: ModuleEnvironment;
  markup_b2b: MarkupRule;
  markup_b2c: MarkupRule;
  base_currency: string;
  tax: ModuleTaxConfig;
  credential_fields: ThirdPartyCredentialFieldOut[];
  help_text?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ThirdPartyModuleUpdate {
  status?: ModuleStatus;
  ai_enabled?: boolean;
  environment?: ModuleEnvironment;
  markup_b2b?: MarkupRule;
  markup_b2c?: MarkupRule;
  base_currency?: string;
  tax?: ModuleTaxConfig;
  /** Only provided keys are merged in — an omitted key keeps its current value. */
  credentials?: Record<string, string>;
}

// ---- Reference data --------------------------------------------------

export interface CurrencyOut {
  id: string;
  code: string;
  symbol: string;
  name: string;
  rate_to_aed: number;
  is_active: boolean;
  country_code?: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CurrencyCreate {
  code: string;
  symbol: string;
  name: string;
  rate_to_aed?: number;
  is_active?: boolean;
  country_code?: string;
  is_default?: boolean;
}

export interface CurrencyUpdate {
  symbol?: string;
  name?: string;
  rate_to_aed?: number;
  is_active?: boolean;
  country_code?: string | null;
  is_default?: boolean;
}

export interface LanguageOut {
  id: string;
  code: string;
  name: string;
  native_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LanguageCreate {
  code: string;
  name: string;
  native_name: string;
  is_active?: boolean;
}

export interface LanguageUpdate {
  name?: string;
  native_name?: string;
  is_active?: boolean;
}

export interface CountryOut {
  id: string;
  code: string;
  name: string;
  dial_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CountryCreate {
  code: string;
  name: string;
  dial_code: string;
  is_active?: boolean;
}

export interface CountryUpdate {
  name?: string;
  dial_code?: string;
  is_active?: boolean;
}

// ---- Properties (public catalog) -------------------------------------

export interface Property {
  id: string;
  name: string;
  description?: string;
  city: string;
  country: string;
  address?: string;
  property_type: string;
  price_per_night: number;
  currency: string;
  rating?: number;
  image_url?: string;
  amenities?: string[];
}

export interface PropertyCreate {
  name: string;
  description?: string;
  city: string;
  country: string;
  address?: string;
  property_type: string;
  price_per_night: number;
  currency?: string;
  image_url?: string;
  amenities?: string[];
}

export interface PropertyUpdate {
  name?: string;
  description?: string;
  city?: string;
  country?: string;
  address?: string;
  property_type?: string;
  price_per_night?: number;
  currency?: string;
  image_url?: string;
  amenities?: string[];
}

// ---- Site theme (singleton) ---------------------------------------------

export type HeaderVariant = "default" | "classic" | "variant_2" | "variant_3" | "variant_4" | "variant_5";
export type FooterVariant = "classic" | "variant_2" | "variant_3" | "variant_4" | "variant_5";
export type FontSizeOption = "sm" | "md" | "lg" | "xl";
export type FontFamilyOption = "outfit" | "inter" | "poppins" | "playfair_display" | "roboto";

export interface SiteThemeOut {
  id: string;
  header_variant: HeaderVariant;
  footer_variant: FooterVariant;
  heading_font_size: FontSizeOption;
  paragraph_font_size: FontSizeOption;
  font_family: FontFamilyOption;
  logo_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SiteThemeUpdate {
  header_variant?: HeaderVariant;
  footer_variant?: FooterVariant;
  heading_font_size?: FontSizeOption;
  paragraph_font_size?: FontSizeOption;
  font_family?: FontFamilyOption;
}

// ---- Stays Config ---------------------------------------------------------

export type StaySettingType =
  | "stay_amenity"
  | "room_type"
  | "room_amenity"
  | "accommodation"
  | "board";

export interface StaySettingOut {
  id: string;
  setting_type: StaySettingType;
  name: string;
  is_active: boolean;
  /** Keyed by language code, e.g. `{ fr: "Wifi gratuit", vi: "..." }`. */
  translations: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface StaySettingCreate {
  setting_type: StaySettingType;
  name: string;
  is_active?: boolean;
  translations?: Record<string, string>;
}

export interface StaySettingUpdate {
  name?: string;
  is_active?: boolean;
  translations?: Record<string, string>;
}

// ---- Property Types ---------------------------------------------------

export interface PropertyTypeOut {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  count_label?: string | null;
  image_url?: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PropertyTypeCreate {
  name: string;
  slug: string;
  description?: string;
  count_label?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface PropertyTypeUpdate {
  name?: string;
  slug?: string;
  description?: string;
  count_label?: string;
  sort_order?: number;
  is_active?: boolean;
}

// ---- Blog -------------------------------------------------------------

export type BlogPostStatus = "draft" | "in_review" | "published" | "scheduled";
export type BlogCommentStatus = "pending" | "approved" | "rejected";

export interface BlogCategoryOut {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  color: string;
  sort_order: number;
  is_visible: boolean;
  post_count: number;
  created_at: string;
  updated_at: string;
}

export interface BlogCategoryCreate {
  name: string;
  slug: string;
  description?: string;
  color?: string;
  sort_order?: number;
  is_visible?: boolean;
}

export interface BlogCategoryUpdate {
  name?: string;
  slug?: string;
  description?: string;
  color?: string;
  sort_order?: number;
  is_visible?: boolean;
}

export interface BlogPostTranslationValue {
  title: string;
  content: string;
}

export interface BlogPostSummaryOut {
  id: string;
  title: string;
  slug: string;
  category_id?: string | null;
  category_name?: string | null;
  category_slug?: string | null;
  excerpt?: string | null;
  cover_image_url?: string | null;
  tags: string[];
  status: BlogPostStatus;
  author_name: string;
  views: number;
  comment_count: number;
  reading_minutes: number;
  published_at?: string | null;
  translation_language_codes: string[];
  created_at: string;
  updated_at: string;
}

export interface BlogPostCountOut {
  total: number;
}

export interface BlogPostOut extends BlogPostSummaryOut {
  content: string;
  meta_title?: string | null;
  meta_description?: string | null;
  focus_keyword?: string | null;
  translations: Record<string, BlogPostTranslationValue>;
}

export interface BlogPostCreate {
  title: string;
  slug: string;
  category_id?: string | null;
  excerpt?: string;
  content?: string;
  tags?: string[];
  status?: BlogPostStatus;
  author_name?: string;
  meta_title?: string;
  meta_description?: string;
  focus_keyword?: string;
  published_at?: string | null;
  translations?: Record<string, BlogPostTranslationValue>;
}

export interface BlogPostUpdate {
  title?: string;
  slug?: string;
  category_id?: string | null;
  excerpt?: string;
  content?: string;
  tags?: string[];
  status?: BlogPostStatus;
  author_name?: string;
  meta_title?: string;
  meta_description?: string;
  focus_keyword?: string;
  published_at?: string | null;
  translations?: Record<string, BlogPostTranslationValue>;
}

export interface BlogCommentPublicOut {
  id: string;
  parent_comment_id?: string | null;
  author_name: string;
  body: string;
  is_admin_reply: boolean;
  status: BlogCommentStatus;
  created_at: string;
}

export interface BlogCommentAdminOut extends BlogCommentPublicOut {
  blog_post_id: string;
  post_title: string;
  post_slug: string;
  author_email: string;
  updated_at: string;
}

export interface BlogCommentCreate {
  author_name: string;
  author_email: string;
  body: string;
  parent_comment_id?: string | null;
}

export interface BlogCommentModerate {
  status: "approved" | "rejected";
}

export interface BlogCommentReplyCreate {
  body: string;
}

// ---- Contact --------------------------------------------------------------

export type ContactTopic =
  | "booking"
  | "refund"
  | "invoice"
  | "stay_issue"
  | "group"
  | "press"
  | "other";
export type ContactChannel = "email" | "phone" | "whatsapp";

export interface ContactMessageCreate {
  full_name: string;
  email: string;
  phone?: string;
  booking_reference?: string;
  topic: ContactTopic;
  preferred_channel?: ContactChannel;
  message: string;
}

export interface ContactMessageOut {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  booking_reference?: string | null;
  topic: string;
  preferred_channel: string;
  message: string;
  status: string;
  created_at: string;
}

export type ContactMessageStatus = "new" | "in_progress" | "resolved";

export interface ContactMessageStatusUpdate {
  status: ContactMessageStatus;
}

// ---- CMS ----------------------------------------------------------------

export type CmsPageStatus = "draft" | "published" | "archived";
export type CmsPageType = "content" | "system";

export interface CmsPageTranslationValue {
  title?: string;
  excerpt?: string;
  content?: string;
  meta_title?: string;
  meta_description?: string;
}

export interface CmsPageSummaryOut {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  featured_image_url?: string | null;
  parent_id?: string | null;
  parent_title?: string | null;
  sort_order: number;
  status: CmsPageStatus;
  is_homepage: boolean;
  author_name: string;
  view_count: number;
  published_at?: string | null;
  page_type: CmsPageType;
  route_path?: string | null;
  translation_language_codes: string[];
  created_at: string;
  updated_at: string;
}

export interface CmsPageOut extends CmsPageSummaryOut {
  content: string;
  meta_title?: string | null;
  meta_description?: string | null;
  translations: Record<string, CmsPageTranslationValue>;
}

export interface CmsPageCreate {
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  parent_id?: string | null;
  sort_order?: number;
  status?: CmsPageStatus;
  is_homepage?: boolean;
  meta_title?: string;
  meta_description?: string;
  author_name?: string;
  published_at?: string | null;
  page_type?: CmsPageType;
  route_path?: string | null;
  translations?: Record<string, CmsPageTranslationValue>;
}

export interface CmsPageUpdate {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  parent_id?: string | null;
  sort_order?: number;
  status?: CmsPageStatus;
  is_homepage?: boolean;
  meta_title?: string;
  meta_description?: string;
  author_name?: string;
  published_at?: string | null;
  page_type?: CmsPageType;
  route_path?: string | null;
  translations?: Record<string, CmsPageTranslationValue>;
}

export interface CmsBlockOut {
  id: string;
  name: string;
  slug: string;
  content: string;
  block_type: string;
  location?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CmsBlockCreate {
  name: string;
  slug: string;
  content?: string;
  block_type?: string;
  location?: string;
  is_active?: boolean;
}

export interface CmsBlockUpdate {
  name?: string;
  slug?: string;
  content?: string;
  block_type?: string;
  location?: string;
  is_active?: boolean;
}

export interface CmsMenuItemOut {
  id: string;
  menu_id: string;
  page_id?: string | null;
  page_slug?: string | null;
  label: string;
  url?: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface CmsMenuItemCreate {
  label: string;
  page_id?: string | null;
  url?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface CmsMenuItemUpdate {
  label?: string;
  page_id?: string | null;
  url?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface CmsMenuOut {
  id: string;
  name: string;
  slug: string;
  location?: string | null;
  is_active: boolean;
  items: CmsMenuItemOut[];
  created_at: string;
  updated_at: string;
}

export interface CmsMenuCreate {
  name: string;
  slug: string;
  location?: string;
  is_active?: boolean;
}

export interface CmsMenuUpdate {
  name?: string;
  slug?: string;
  location?: string;
  is_active?: boolean;
}

// ---- CMS Media ------------------------------------------------------------

export type MediaAssetType = "image" | "document" | "video" | "vector";

export interface MediaFolderOut {
  id: string;
  name: string;
  sort_order: number;
  asset_count: number;
  created_at: string;
  updated_at: string;
}

export interface MediaFolderCreate {
  name: string;
  sort_order?: number;
}

export interface MediaFolderUpdate {
  name?: string;
  sort_order?: number;
}

export interface MediaAssetTranslationValue {
  alt_text?: string;
}

export interface MediaAssetSummaryOut {
  id: string;
  filename: string;
  file_url: string;
  asset_type: MediaAssetType;
  folder_id?: string | null;
  width?: number | null;
  height?: number | null;
  size_bytes: number;
  format: string;
  alt_text: string;
  tags: string[];
  uploaded_by: string;
  used_in_count: number;
  translation_language_codes: string[];
  created_at: string;
  updated_at: string;
}

export interface MediaAssetOut extends MediaAssetSummaryOut {
  translations: Record<string, MediaAssetTranslationValue>;
}

export interface MediaAssetUpdate {
  folder_id?: string | null;
  alt_text?: string;
  tags?: string[];
  translations?: Record<string, MediaAssetTranslationValue>;
}

// ---- Content Revisions ------------------------------------------------

export type RevisionEntityType = "cms_page" | "blog_post";

export interface RevisionSummaryOut {
  id: string;
  entity_type: RevisionEntityType;
  entity_id: string;
  title: string;
  created_by: string;
  created_at: string;
}

export interface RevisionOut extends RevisionSummaryOut {
  snapshot: Record<string, unknown>;
}

// ---- CMS Translation Tasks --------------------------------------------

export type TranslationTaskEntityType = "cms_page" | "blog_post";
export type TranslationTaskStatus = "requested" | "done" | "cancelled";

export interface TranslationTaskCreate {
  entity_type: TranslationTaskEntityType;
  entity_id: string;
  target_language_code: string;
}

export interface TranslationTaskUpdate {
  status: TranslationTaskStatus;
}

export interface TranslationTaskOut {
  id: string;
  entity_type: string;
  entity_id: string;
  entity_title?: string | null;
  target_language_code: string;
  status: string;
  requested_by: string;
  created_at: string;
  updated_at: string;
}
