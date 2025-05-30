export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      business_moderators: {
        Row: {
          business_id: string
          created_at: string | null
          id: string
          invited_by: string
          role: string | null
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string | null
          id?: string
          invited_by: string
          role?: string | null
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string | null
          id?: string
          invited_by?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_moderators_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          banner_url: string | null
          category: string
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          location: string | null
          logo_url: string | null
          name: string
          owner_id: string
          phone: string | null
          status: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          banner_url?: string | null
          category: string
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          location?: string | null
          logo_url?: string | null
          name: string
          owner_id: string
          phone?: string | null
          status?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          banner_url?: string | null
          category?: string
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          location?: string | null
          logo_url?: string | null
          name?: string
          owner_id?: string
          phone?: string | null
          status?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      external_job_tracking: {
        Row: {
          completed_at: string | null
          created_at: string
          external_job_id: string | null
          external_response: Json | null
          id: string
          job_type: string
          motorcycle_id: string
          service_description: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          external_job_id?: string | null
          external_response?: Json | null
          id?: string
          job_type?: string
          motorcycle_id: string
          service_description?: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          external_job_id?: string | null
          external_response?: Json | null
          id?: string
          job_type?: string
          motorcycle_id?: string
          service_description?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_job_tracking_motorcycle_id_fkey"
            columns: ["motorcycle_id"]
            isOneToOne: false
            referencedRelation: "motorcycles"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_categories: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      forum_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          parent_id: string | null
          post_id: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          post_id: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          post_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "forum_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          author_id: string
          category_id: string
          content: string
          created_at: string | null
          id: string
          is_hidden: boolean | null
          is_locked: boolean | null
          is_pinned: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          category_id: string
          content: string
          created_at?: string | null
          id?: string
          is_hidden?: boolean | null
          is_locked?: boolean | null
          is_pinned?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          category_id?: string
          content?: string
          created_at?: string | null
          id?: string
          is_hidden?: boolean | null
          is_locked?: boolean | null
          is_pinned?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "forum_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      group_event_participants: {
        Row: {
          event_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          event_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          event_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_event_participants_event"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "group_events"
            referencedColumns: ["id"]
          },
        ]
      }
      group_events: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          event_date: string
          group_id: string
          id: string
          location: string | null
          max_participants: number | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          event_date: string
          group_id: string
          id?: string
          location?: string | null
          max_participants?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          event_date?: string
          group_id?: string
          id?: string
          location?: string | null
          max_participants?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_group_events_group"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_requests: {
        Row: {
          group_id: string
          id: string
          requested_at: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          requested_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          requested_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_requests_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          join_type: string | null
          leader_id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          join_type?: string | null
          leader_id: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          join_type?: string | null
          leader_id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      maintenance_records: {
        Row: {
          cost: number | null
          created_at: string | null
          date_performed: string
          description: string
          id: string
          mileage: number | null
          motorcycle_id: string
          notes: string | null
          parts_used: string | null
        }
        Insert: {
          cost?: number | null
          created_at?: string | null
          date_performed: string
          description: string
          id?: string
          mileage?: number | null
          motorcycle_id: string
          notes?: string | null
          parts_used?: string | null
        }
        Update: {
          cost?: number | null
          created_at?: string | null
          date_performed?: string
          description?: string
          id?: string
          mileage?: number | null
          motorcycle_id?: string
          notes?: string | null
          parts_used?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_records_motorcycle_id_fkey"
            columns: ["motorcycle_id"]
            isOneToOne: false
            referencedRelation: "motorcycles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_listings: {
        Row: {
          accident_history: boolean | null
          asking_price: number
          condition_rating: number | null
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          mileage: number | null
          modifications: string[] | null
          motorcycle_id: string
          recommended_price: number | null
          seller_id: string
          service_records_count: number | null
          sold_at: string | null
          sold_to: string | null
          status: string
          updated_at: string
        }
        Insert: {
          accident_history?: boolean | null
          asking_price: number
          condition_rating?: number | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          mileage?: number | null
          modifications?: string[] | null
          motorcycle_id: string
          recommended_price?: number | null
          seller_id: string
          service_records_count?: number | null
          sold_at?: string | null
          sold_to?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          accident_history?: boolean | null
          asking_price?: number
          condition_rating?: number | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          mileage?: number | null
          modifications?: string[] | null
          motorcycle_id?: string
          recommended_price?: number | null
          seller_id?: string
          service_records_count?: number | null
          sold_at?: string | null
          sold_to?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_listings_motorcycle_id_fkey"
            columns: ["motorcycle_id"]
            isOneToOne: false
            referencedRelation: "motorcycles"
            referencedColumns: ["id"]
          },
        ]
      }
      motorcycle_valuations: {
        Row: {
          accident_history_adjustment: number | null
          base_value: number
          calculated_at: string
          condition_adjustment: number | null
          factors_used: Json | null
          final_recommended_value: number
          id: string
          market_demand_adjustment: number | null
          mileage_adjustment: number | null
          modifications_adjustment: number | null
          motorcycle_id: string
          service_history_adjustment: number | null
        }
        Insert: {
          accident_history_adjustment?: number | null
          base_value: number
          calculated_at?: string
          condition_adjustment?: number | null
          factors_used?: Json | null
          final_recommended_value: number
          id?: string
          market_demand_adjustment?: number | null
          mileage_adjustment?: number | null
          modifications_adjustment?: number | null
          motorcycle_id: string
          service_history_adjustment?: number | null
        }
        Update: {
          accident_history_adjustment?: number | null
          base_value?: number
          calculated_at?: string
          condition_adjustment?: number | null
          factors_used?: Json | null
          final_recommended_value?: number
          id?: string
          market_demand_adjustment?: number | null
          mileage_adjustment?: number | null
          modifications_adjustment?: number | null
          motorcycle_id?: string
          service_history_adjustment?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "motorcycle_valuations_motorcycle_id_fkey"
            columns: ["motorcycle_id"]
            isOneToOne: false
            referencedRelation: "motorcycles"
            referencedColumns: ["id"]
          },
        ]
      }
      motorcycles: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          make: string
          model: string
          nickname: string | null
          owner_id: string
          updated_at: string | null
          vin: string | null
          year: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          make: string
          model: string
          nickname?: string | null
          owner_id: string
          updated_at?: string | null
          vin?: string | null
          year: number
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          make?: string
          model?: string
          nickname?: string | null
          owner_id?: string
          updated_at?: string | null
          vin?: string | null
          year?: number
        }
        Relationships: []
      }
      news_articles: {
        Row: {
          author_id: string
          category: string
          content: string
          created_at: string
          excerpt: string | null
          id: string
          image_url: string | null
          is_featured: boolean
          is_published: boolean
          published_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          category?: string
          content: string
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean
          is_published?: boolean
          published_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          category?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean
          is_published?: boolean
          published_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      news_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      news_comments: {
        Row: {
          article_id: string
          author_id: string
          content: string
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          article_id: string
          author_id: string
          content: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          article_id?: string
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_news_comments_article"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "news_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          price: number
          product_id: string
          quantity: number
          variation: Json | null
        }
        Insert: {
          id?: string
          order_id: string
          price: number
          product_id: string
          quantity?: number
          variation?: Json | null
        }
        Update: {
          id?: string
          order_id?: string
          price?: number
          product_id?: string
          quantity?: number
          variation?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          business_id: string
          buyer_id: string
          created_at: string | null
          delivery_instructions: string | null
          estimated_delivery: string | null
          id: string
          notes: string | null
          shipping_address: Json | null
          shipping_method: string | null
          status: string | null
          total_amount: number
          tracking_number: string | null
          updated_at: string | null
        }
        Insert: {
          business_id: string
          buyer_id: string
          created_at?: string | null
          delivery_instructions?: string | null
          estimated_delivery?: string | null
          id?: string
          notes?: string | null
          shipping_address?: Json | null
          shipping_method?: string | null
          status?: string | null
          total_amount: number
          tracking_number?: string | null
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          buyer_id?: string
          created_at?: string | null
          delivery_instructions?: string | null
          estimated_delivery?: string | null
          id?: string
          notes?: string | null
          shipping_address?: Json | null
          shipping_method?: string | null
          status?: string | null
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          price_adjustment: number | null
          product_id: string
          sku: string | null
          stock_quantity: number | null
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          price_adjustment?: number | null
          product_id: string
          sku?: string | null
          stock_quantity?: number | null
          value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          price_adjustment?: number | null
          product_id?: string
          sku?: string | null
          stock_quantity?: number | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          bulk_discount_tiers: Json | null
          business_id: string
          category: string
          created_at: string | null
          description: string | null
          id: string
          images: string[] | null
          is_active: boolean | null
          price: number
          promotion_end: string | null
          promotion_start: string | null
          promotional_price: number | null
          stock_quantity: number | null
          title: string
          updated_at: string | null
          variations: Json | null
        }
        Insert: {
          bulk_discount_tiers?: Json | null
          business_id: string
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          price: number
          promotion_end?: string | null
          promotion_start?: string | null
          promotional_price?: number | null
          stock_quantity?: number | null
          title: string
          updated_at?: string | null
          variations?: Json | null
        }
        Update: {
          bulk_discount_tiers?: Json | null
          business_id?: string
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          price?: number
          promotion_end?: string | null
          promotion_start?: string | null
          promotional_price?: number | null
          stock_quantity?: number | null
          title?: string
          updated_at?: string | null
          variations?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "products_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          dashboard_layout: Json | null
          first_name: string | null
          id: string
          last_name: string | null
          preferences: Json | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          dashboard_layout?: Json | null
          first_name?: string | null
          id: string
          last_name?: string | null
          preferences?: Json | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          dashboard_layout?: Json | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          preferences?: Json | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      review_responses: {
        Row: {
          created_at: string | null
          id: string
          responder_id: string
          response_text: string
          review_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          responder_id: string
          response_text: string
          review_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          responder_id?: string
          response_text?: string
          review_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_responses_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          business_id: string | null
          business_response: string | null
          business_response_date: string | null
          comment: string | null
          created_at: string | null
          flagged_by: string | null
          flagged_reason: string | null
          id: string
          is_flagged: boolean | null
          is_verified: boolean | null
          product_id: string | null
          rating: number
          reviewer_id: string
          updated_at: string | null
        }
        Insert: {
          business_id?: string | null
          business_response?: string | null
          business_response_date?: string | null
          comment?: string | null
          created_at?: string | null
          flagged_by?: string | null
          flagged_reason?: string | null
          id?: string
          is_flagged?: boolean | null
          is_verified?: boolean | null
          product_id?: string | null
          rating: number
          reviewer_id: string
          updated_at?: string | null
        }
        Update: {
          business_id?: string | null
          business_response?: string | null
          business_response_date?: string | null
          comment?: string | null
          created_at?: string | null
          flagged_by?: string | null
          flagged_reason?: string | null
          id?: string
          is_flagged?: boolean | null
          is_verified?: boolean | null
          product_id?: string | null
          rating?: number
          reviewer_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      route_comments: {
        Row: {
          comment: string | null
          created_at: string | null
          flagged_reason: string | null
          id: string
          is_flagged: boolean | null
          rating: number
          route_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          flagged_reason?: string | null
          id?: string
          is_flagged?: boolean | null
          rating: number
          route_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          flagged_reason?: string | null
          id?: string
          is_flagged?: boolean | null
          rating?: number
          route_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_comments_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      route_danger_zones: {
        Row: {
          created_at: string | null
          danger_type: string
          description: string
          id: string
          location: Json
          route_id: string
          severity: string
        }
        Insert: {
          created_at?: string | null
          danger_type: string
          description: string
          id?: string
          location: Json
          route_id: string
          severity: string
        }
        Update: {
          created_at?: string | null
          danger_type?: string
          description?: string
          id?: string
          location?: Json
          route_id?: string
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_danger_zones_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      route_photos: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          order_index: number
          photo_url: string
          route_id: string
          uploaded_by: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          order_index?: number
          photo_url: string
          route_id: string
          uploaded_by: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          order_index?: number
          photo_url?: string
          route_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_photos_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      route_pit_stops: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          location: Json
          name: string
          order_index: number
          route_id: string
          type: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          location: Json
          name: string
          order_index: number
          route_id: string
          type: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          location?: Json
          name?: string
          order_index?: number
          route_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_pit_stops_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          created_at: string | null
          created_by: string
          description: string
          difficulty_level: string
          distance_km: number | null
          end_point: Json
          estimated_duration_hours: number | null
          id: string
          is_active: boolean | null
          start_point: Json
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description: string
          difficulty_level: string
          distance_km?: number | null
          end_point: Json
          estimated_duration_hours?: number | null
          id?: string
          is_active?: boolean | null
          start_point: Json
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string
          difficulty_level?: string
          distance_km?: number | null
          end_point?: Json
          estimated_duration_hours?: number | null
          id?: string
          is_active?: boolean | null
          start_point?: Json
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: Database["public"]["Enums"]["ticket_category"]
          created_at: string
          description: string
          id: string
          last_activity_at: string
          priority: number
          resolved_at: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          subject: string
          ticket_number: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          category: Database["public"]["Enums"]["ticket_category"]
          created_at?: string
          description: string
          id?: string
          last_activity_at?: string
          priority?: number
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject: string
          ticket_number?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          category?: Database["public"]["Enums"]["ticket_category"]
          created_at?: string
          description?: string
          id?: string
          last_activity_at?: string
          priority?: number
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject?: string
          ticket_number?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ticket_messages: {
        Row: {
          created_at: string
          id: string
          is_internal: boolean
          message: string
          sender_id: string
          ticket_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_internal?: boolean
          message: string
          sender_id: string
          ticket_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_internal?: boolean
          message?: string
          sender_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_responses: {
        Row: {
          created_at: string
          id: string
          is_staff_response: boolean
          responder_id: string
          response_text: string
          ticket_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_staff_response?: boolean
          responder_id: string
          response_text: string
          ticket_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_staff_response?: boolean
          responder_id?: string
          response_text?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_responses_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string | null
          id: string
          setting_key: string
          setting_value: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          setting_key: string
          setting_value?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_motorcycle_valuation: {
        Args: {
          p_motorcycle_id: string
          p_mileage?: number
          p_condition_rating?: number
          p_accident_history?: boolean
          p_service_records_count?: number
          p_modifications?: string[]
        }
        Returns: number
      }
      contains_profanity: {
        Args: { text_content: string }
        Returns: boolean
      }
      get_route_average_rating: {
        Args: { route_id_param: string }
        Returns: number
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      join_open_group: {
        Args: { group_id_param: string }
        Returns: boolean
      }
      sanitize_text: {
        Args: { input_text: string }
        Returns: string
      }
    }
    Enums: {
      ticket_category:
        | "technical"
        | "account"
        | "billing"
        | "feature_request"
        | "bug_report"
        | "other"
      ticket_status: "new" | "in_progress" | "resolved" | "escalated"
      user_role: "rider" | "support" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      ticket_category: [
        "technical",
        "account",
        "billing",
        "feature_request",
        "bug_report",
        "other",
      ],
      ticket_status: ["new", "in_progress", "resolved", "escalated"],
      user_role: ["rider", "support", "admin"],
    },
  },
} as const
