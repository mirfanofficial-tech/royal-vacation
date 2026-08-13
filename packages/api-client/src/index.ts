import { ApiClient } from "./http.js";
import type {
  AuthResponse,
  BlogCategoryCreate,
  BlogCategoryOut,
  BlogCategoryUpdate,
  BlogCommentAdminOut,
  BlogCommentCreate,
  BlogCommentModerate,
  BlogCommentPublicOut,
  BlogCommentReplyCreate,
  BlogPostCreate,
  BlogPostOut,
  BlogPostSummaryOut,
  BlogPostUpdate,
  ChangePasswordRequest,
  CmsBlockCreate,
  CmsBlockOut,
  CmsBlockUpdate,
  CmsMenuCreate,
  CmsMenuItemCreate,
  CmsMenuItemUpdate,
  CmsMenuOut,
  CmsMenuUpdate,
  CmsPageCreate,
  CmsPageOut,
  CmsPageSummaryOut,
  CmsPageUpdate,
  ConfirmResetRequest,
  CountryCreate,
  CountryOut,
  CountryUpdate,
  CurrencyCreate,
  CurrencyOut,
  CurrencyUpdate,
  HealthResponse,
  LanguageCreate,
  LanguageOut,
  LanguageUpdate,
  LoginRequest,
  LogoutRequest,
  MessageResponse,
  PartnerListParams,
  PartnerProfileOut,
  PartnerProfileSelfUpdate,
  PartnerProfileUpdate,
  PartnerSummaryOut,
  PasswordResetRequest,
  PasswordResetRequestOut,
  PaymentGatewayCreate,
  PaymentGatewayOut,
  PaymentGatewayUpdate,
  PermissionOut,
  PreferencesUpdate,
  ProfileUpdate,
  Property,
  PropertyCreate,
  PropertyTypeCreate,
  PropertyTypeOut,
  PropertyTypeUpdate,
  PropertyUpdate,
  RefreshTokenRequest,
  RegisterRequest,
  RoleCreate,
  RoleOut,
  RolePermissionsUpdate,
  RoleUpdate,
  SiteThemeOut,
  SiteThemeUpdate,
  StaySettingCreate,
  StaySettingOut,
  StaySettingUpdate,
  ThirdPartyModuleOut,
  ThirdPartyModuleUpdate,
  TokenPair,
  TravelerProfileOut,
  TravelerProfileUpdate,
  UserActivityLogOut,
  UserCreate,
  UserListParams,
  UserOut,
  UserRolesUpdate,
  UserSessionOut,
  UserUpdate,
  VerifyEmailRequest,
} from "./types.js";

export class RoyalVacationApi extends ApiClient {
  health() {
    return this.get<HealthResponse>("/api/v1/health");
  }

  // ---- Authentication — public account lifecycle ----------------------

  auth = {
    register: (body: RegisterRequest) =>
      this.post<AuthResponse>("/api/v1/auth/register", body),
    login: (body: LoginRequest) =>
      this.post<AuthResponse>("/api/v1/auth/login", body),
    logout: (body: LogoutRequest) =>
      this.post<void>("/api/v1/auth/logout", body),
    refreshToken: (body: RefreshTokenRequest) =>
      this.post<TokenPair>("/api/v1/auth/refresh-token", body),
    verifyEmail: (body: VerifyEmailRequest) =>
      this.post<MessageResponse>("/api/v1/auth/verify-email", body),
    resetPassword: (body: PasswordResetRequest) =>
      this.post<PasswordResetRequestOut>("/api/v1/auth/reset-password", body),
    confirmReset: (body: ConfirmResetRequest) =>
      this.post<MessageResponse>("/api/v1/auth/confirm-reset", body),
    me: () => this.get<UserOut>("/api/v1/auth/me"),
  };

  // ---- Admin management — admin-gated -----------------------------------

  admin = {
    users: {
      list: (params: UserListParams = {}) =>
        this.get<UserOut[]>("/api/v1/admin/users", { query: params }),
      get: (id: string) => this.get<UserOut>(`/api/v1/admin/users/${id}`),
      create: (body: UserCreate) =>
        this.post<UserOut>("/api/v1/admin/users", body),
      update: (id: string, body: UserUpdate) =>
        this.put<UserOut>(`/api/v1/admin/users/${id}`, body),
      remove: (id: string) => this.delete<void>(`/api/v1/admin/users/${id}`),
      suspend: (id: string) =>
        this.post<UserOut>(`/api/v1/admin/users/${id}/suspend`),
      activate: (id: string) =>
        this.post<UserOut>(`/api/v1/admin/users/${id}/activate`),
      setRoles: (id: string, body: UserRolesUpdate) =>
        this.put<UserOut>(`/api/v1/admin/users/${id}/roles`, body),
      sessions: (id: string, activeOnly = false) =>
        this.get<UserSessionOut[]>(`/api/v1/admin/users/${id}/sessions`, {
          query: { active_only: activeOnly },
        }),
      activity: (id: string, limit = 50) =>
        this.get<UserActivityLogOut[]>(`/api/v1/admin/users/${id}/activity`, {
          query: { limit },
        }),
    },
    partners: {
      list: (params: PartnerListParams = {}) =>
        this.get<PartnerSummaryOut[]>("/api/v1/admin/partners", {
          query: params,
        }),
      verify: (userId: string) =>
        this.post<PartnerProfileOut>(`/api/v1/admin/partners/${userId}/verify`),
    },
    roles: {
      list: () => this.get<RoleOut[]>("/api/v1/admin/roles"),
      get: (id: string) => this.get<RoleOut>(`/api/v1/admin/roles/${id}`),
      create: (body: RoleCreate) =>
        this.post<RoleOut>("/api/v1/admin/roles", body),
      update: (id: string, body: RoleUpdate) =>
        this.patch<RoleOut>(`/api/v1/admin/roles/${id}`, body),
      remove: (id: string) => this.delete<void>(`/api/v1/admin/roles/${id}`),
      permissions: (id: string) =>
        this.get<PermissionOut[]>(`/api/v1/admin/roles/${id}/permissions`),
      setPermissions: (id: string, body: RolePermissionsUpdate) =>
        this.put<PermissionOut[]>(`/api/v1/admin/roles/${id}/permissions`, body),
    },
    profiles: {
      getPartner: (userId: string) =>
        this.get<PartnerProfileOut>(`/api/v1/admin/profiles/partners/${userId}`),
      updatePartner: (userId: string, body: PartnerProfileUpdate) =>
        this.patch<PartnerProfileOut>(
          `/api/v1/admin/profiles/partners/${userId}`,
          body
        ),
      getTraveler: (userId: string) =>
        this.get<TravelerProfileOut>(
          `/api/v1/admin/profiles/travelers/${userId}`
        ),
      updateTraveler: (userId: string, body: TravelerProfileUpdate) =>
        this.patch<TravelerProfileOut>(
          `/api/v1/admin/profiles/travelers/${userId}`,
          body
        ),
    },
    reference: {
      currencies: {
        list: () => this.get<CurrencyOut[]>("/api/v1/admin/reference/currencies"),
        get: (id: string) =>
          this.get<CurrencyOut>(`/api/v1/admin/reference/currencies/${id}`),
        create: (body: CurrencyCreate) =>
          this.post<CurrencyOut>("/api/v1/admin/reference/currencies", body),
        update: (id: string, body: CurrencyUpdate) =>
          this.patch<CurrencyOut>(`/api/v1/admin/reference/currencies/${id}`, body),
        remove: (id: string) =>
          this.delete<void>(`/api/v1/admin/reference/currencies/${id}`),
      },
      languages: {
        list: () => this.get<LanguageOut[]>("/api/v1/admin/reference/languages"),
        get: (id: string) =>
          this.get<LanguageOut>(`/api/v1/admin/reference/languages/${id}`),
        create: (body: LanguageCreate) =>
          this.post<LanguageOut>("/api/v1/admin/reference/languages", body),
        update: (id: string, body: LanguageUpdate) =>
          this.patch<LanguageOut>(`/api/v1/admin/reference/languages/${id}`, body),
        remove: (id: string) =>
          this.delete<void>(`/api/v1/admin/reference/languages/${id}`),
      },
      countries: {
        list: () => this.get<CountryOut[]>("/api/v1/admin/reference/countries"),
        get: (id: string) =>
          this.get<CountryOut>(`/api/v1/admin/reference/countries/${id}`),
        create: (body: CountryCreate) =>
          this.post<CountryOut>("/api/v1/admin/reference/countries", body),
        update: (id: string, body: CountryUpdate) =>
          this.patch<CountryOut>(`/api/v1/admin/reference/countries/${id}`, body),
        remove: (id: string) =>
          this.delete<void>(`/api/v1/admin/reference/countries/${id}`),
      },
    },
    paymentGateways: {
      list: () => this.get<PaymentGatewayOut[]>("/api/v1/admin/payment-gateways"),
      get: (id: string) =>
        this.get<PaymentGatewayOut>(`/api/v1/admin/payment-gateways/${id}`),
      create: (body: PaymentGatewayCreate) =>
        this.post<PaymentGatewayOut>("/api/v1/admin/payment-gateways", body),
      update: (id: string, body: PaymentGatewayUpdate) =>
        this.patch<PaymentGatewayOut>(`/api/v1/admin/payment-gateways/${id}`, body),
      remove: (id: string) =>
        this.delete<void>(`/api/v1/admin/payment-gateways/${id}`),
      setDefault: (id: string) =>
        this.post<PaymentGatewayOut>(`/api/v1/admin/payment-gateways/${id}/set-default`),
    },
    modules: {
      list: () => this.get<ThirdPartyModuleOut[]>("/api/v1/admin/modules"),
      get: (id: string) => this.get<ThirdPartyModuleOut>(`/api/v1/admin/modules/${id}`),
      update: (id: string, body: ThirdPartyModuleUpdate) =>
        this.patch<ThirdPartyModuleOut>(`/api/v1/admin/modules/${id}`, body),
    },
    theme: {
      get: () => this.get<SiteThemeOut>("/api/v1/admin/theme"),
      update: (body: SiteThemeUpdate) => this.patch<SiteThemeOut>("/api/v1/admin/theme", body),
      uploadLogo: (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        return this.postForm<SiteThemeOut>("/api/v1/admin/theme/logo", formData);
      },
    },
    stays: {
      list: (settingType?: string) =>
        this.get<StaySettingOut[]>("/api/v1/admin/stays/settings", {
          query: settingType ? { setting_type: settingType } : undefined,
        }),
      get: (id: string) => this.get<StaySettingOut>(`/api/v1/admin/stays/settings/${id}`),
      create: (body: StaySettingCreate) =>
        this.post<StaySettingOut>("/api/v1/admin/stays/settings", body),
      update: (id: string, body: StaySettingUpdate) =>
        this.patch<StaySettingOut>(`/api/v1/admin/stays/settings/${id}`, body),
      remove: (id: string) => this.delete<void>(`/api/v1/admin/stays/settings/${id}`),
      propertyTypes: {
        list: () => this.get<PropertyTypeOut[]>("/api/v1/admin/stays/property-types"),
        get: (id: string) =>
          this.get<PropertyTypeOut>(`/api/v1/admin/stays/property-types/${id}`),
        create: (body: PropertyTypeCreate) =>
          this.post<PropertyTypeOut>("/api/v1/admin/stays/property-types", body),
        update: (id: string, body: PropertyTypeUpdate) =>
          this.patch<PropertyTypeOut>(`/api/v1/admin/stays/property-types/${id}`, body),
        remove: (id: string) =>
          this.delete<void>(`/api/v1/admin/stays/property-types/${id}`),
        uploadImage: (id: string, file: File) => {
          const formData = new FormData();
          formData.append("file", file);
          return this.postForm<PropertyTypeOut>(
            `/api/v1/admin/stays/property-types/${id}/image`,
            formData
          );
        },
      },
    },
    blog: {
      categories: {
        list: () => this.get<BlogCategoryOut[]>("/api/v1/admin/blog/categories"),
        get: (id: string) => this.get<BlogCategoryOut>(`/api/v1/admin/blog/categories/${id}`),
        create: (body: BlogCategoryCreate) =>
          this.post<BlogCategoryOut>("/api/v1/admin/blog/categories", body),
        update: (id: string, body: BlogCategoryUpdate) =>
          this.patch<BlogCategoryOut>(`/api/v1/admin/blog/categories/${id}`, body),
        remove: (id: string) => this.delete<void>(`/api/v1/admin/blog/categories/${id}`),
      },
      posts: {
        list: (params?: { category_id?: string; status?: string; q?: string }) =>
          this.get<BlogPostSummaryOut[]>("/api/v1/admin/blog/posts", { query: params }),
        get: (id: string) => this.get<BlogPostOut>(`/api/v1/admin/blog/posts/${id}`),
        create: (body: BlogPostCreate) => this.post<BlogPostOut>("/api/v1/admin/blog/posts", body),
        update: (id: string, body: BlogPostUpdate) =>
          this.patch<BlogPostOut>(`/api/v1/admin/blog/posts/${id}`, body),
        remove: (id: string) => this.delete<void>(`/api/v1/admin/blog/posts/${id}`),
        uploadCoverImage: (id: string, file: File) => {
          const formData = new FormData();
          formData.append("file", file);
          return this.postForm<BlogPostOut>(
            `/api/v1/admin/blog/posts/${id}/cover-image`,
            formData
          );
        },
      },
      comments: {
        list: (params?: { status?: string; blog_post_id?: string }) =>
          this.get<BlogCommentAdminOut[]>("/api/v1/admin/blog/comments", { query: params }),
        moderate: (id: string, body: BlogCommentModerate) =>
          this.patch<BlogCommentAdminOut>(`/api/v1/admin/blog/comments/${id}`, body),
        remove: (id: string) => this.delete<void>(`/api/v1/admin/blog/comments/${id}`),
        reply: (id: string, body: BlogCommentReplyCreate) =>
          this.post<BlogCommentAdminOut>(`/api/v1/admin/blog/comments/${id}/reply`, body),
      },
    },
    cms: {
      pages: {
        list: (params?: { status?: string; q?: string }) =>
          this.get<CmsPageSummaryOut[]>("/api/v1/admin/cms/pages", { query: params }),
        get: (id: string) => this.get<CmsPageOut>(`/api/v1/admin/cms/pages/${id}`),
        create: (body: CmsPageCreate) => this.post<CmsPageOut>("/api/v1/admin/cms/pages", body),
        update: (id: string, body: CmsPageUpdate) =>
          this.patch<CmsPageOut>(`/api/v1/admin/cms/pages/${id}`, body),
        remove: (id: string) => this.delete<void>(`/api/v1/admin/cms/pages/${id}`),
        uploadFeaturedImage: (id: string, file: File) => {
          const formData = new FormData();
          formData.append("file", file);
          return this.postForm<CmsPageOut>(
            `/api/v1/admin/cms/pages/${id}/featured-image`,
            formData
          );
        },
      },
      blocks: {
        list: (params?: { location?: string }) =>
          this.get<CmsBlockOut[]>("/api/v1/admin/cms/blocks", { query: params }),
        get: (id: string) => this.get<CmsBlockOut>(`/api/v1/admin/cms/blocks/${id}`),
        create: (body: CmsBlockCreate) => this.post<CmsBlockOut>("/api/v1/admin/cms/blocks", body),
        update: (id: string, body: CmsBlockUpdate) =>
          this.patch<CmsBlockOut>(`/api/v1/admin/cms/blocks/${id}`, body),
        remove: (id: string) => this.delete<void>(`/api/v1/admin/cms/blocks/${id}`),
      },
      menus: {
        list: () => this.get<CmsMenuOut[]>("/api/v1/admin/cms/menus"),
        get: (id: string) => this.get<CmsMenuOut>(`/api/v1/admin/cms/menus/${id}`),
        create: (body: CmsMenuCreate) => this.post<CmsMenuOut>("/api/v1/admin/cms/menus", body),
        update: (id: string, body: CmsMenuUpdate) =>
          this.patch<CmsMenuOut>(`/api/v1/admin/cms/menus/${id}`, body),
        remove: (id: string) => this.delete<void>(`/api/v1/admin/cms/menus/${id}`),
        addItem: (menuId: string, body: CmsMenuItemCreate) =>
          this.post<CmsMenuOut>(`/api/v1/admin/cms/menus/${menuId}/items`, body),
        updateItem: (menuId: string, itemId: string, body: CmsMenuItemUpdate) =>
          this.patch<CmsMenuOut>(`/api/v1/admin/cms/menus/${menuId}/items/${itemId}`, body),
        removeItem: (menuId: string, itemId: string) =>
          this.delete<CmsMenuOut>(`/api/v1/admin/cms/menus/${menuId}/items/${itemId}`),
      },
    },
  };

  // ---- Partner management — self-service for the calling partner --------

  partner = {
    getProfile: () => this.get<PartnerProfileOut>("/api/v1/partner/profile"),
    updateProfile: (body: PartnerProfileSelfUpdate) =>
      this.put<PartnerProfileOut>("/api/v1/partner/profile", body),
    // Not implemented on the backend yet — properties/bookings aren't
    // DB-modeled with partner ownership. Both throw ApiError(501).
    listProperties: () => this.get<never>("/api/v1/partner/properties"),
    createProperty: () => this.post<never>("/api/v1/partner/properties"),
    listBookings: () => this.get<never>("/api/v1/partner/bookings"),
  };

  // ---- User profile — self-service for any authenticated account --------

  profile = {
    get: () => this.get<UserOut>("/api/v1/profile"),
    update: (body: ProfileUpdate) => this.put<UserOut>("/api/v1/profile", body),
    changePassword: (body: ChangePasswordRequest) =>
      this.post<void>("/api/v1/profile/change-password", body),
    updatePreferences: (body: PreferencesUpdate) =>
      this.put<UserOut>("/api/v1/profile/preferences", body),
    // Not implemented on the backend yet — no bookings table. Throws
    // ApiError(501).
    listBookings: () => this.get<never>("/api/v1/profile/bookings"),
  };

  // ---- Public reference data ---------------------------------------------

  reference = {
    currencies: () => this.get<CurrencyOut[]>("/api/v1/reference/currencies"),
    languages: () => this.get<LanguageOut[]>("/api/v1/reference/languages"),
    countries: () => this.get<CountryOut[]>("/api/v1/reference/countries"),
  };

  // ---- Public site theme --------------------------------------------------

  theme = {
    get: () => this.get<SiteThemeOut>("/api/v1/theme"),
  };

  // ---- Public property types -----------------------------------------------

  propertyTypes = {
    list: () => this.get<PropertyTypeOut[]>("/api/v1/property-types"),
  };

  // ---- Public blog ---------------------------------------------------------

  blog = {
    categories: {
      list: () => this.get<BlogCategoryOut[]>("/api/v1/blog/categories"),
    },
    posts: {
      list: (params?: { category?: string; q?: string; limit?: number; offset?: number }) =>
        this.get<BlogPostSummaryOut[]>("/api/v1/blog/posts", { query: params }),
      get: (slug: string) => this.get<BlogPostOut>(`/api/v1/blog/posts/${slug}`),
    },
    comments: {
      list: (slug: string) => this.get<BlogCommentPublicOut[]>(`/api/v1/blog/posts/${slug}/comments`),
      create: (slug: string, body: BlogCommentCreate) =>
        this.post<BlogCommentPublicOut>(`/api/v1/blog/posts/${slug}/comments`, body),
    },
  };

  // ---- Public CMS -----------------------------------------------------------

  cms = {
    pages: {
      list: () => this.get<CmsPageSummaryOut[]>("/api/v1/cms/pages"),
      get: (slug: string) => this.get<CmsPageOut>(`/api/v1/cms/pages/${slug}`),
      getByRoute: (path: string) =>
        this.get<CmsPageOut>("/api/v1/cms/pages/by-route", { query: { path } }),
    },
    blocks: {
      list: (location?: string) =>
        this.get<CmsBlockOut[]>("/api/v1/cms/blocks", { query: { location } }),
    },
    menus: {
      get: (location: string) => this.get<CmsMenuOut>(`/api/v1/cms/menus/${location}`),
    },
  };

  // ---- Public property catalog -------------------------------------------

  properties = {
    list: () => this.get<Property[]>("/api/v1/properties"),
    get: (id: string) => this.get<Property>(`/api/v1/properties/${id}`),
    create: (body: PropertyCreate) =>
      this.post<Property>("/api/v1/properties", body),
    update: (id: string, body: PropertyUpdate) =>
      this.patch<Property>(`/api/v1/properties/${id}`, body),
    remove: (id: string) =>
      this.delete<{ ok: boolean }>(`/api/v1/properties/${id}`),
  };
}

export * from "./http.js";
export * from "./types.js";
