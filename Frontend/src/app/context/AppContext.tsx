import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { CartItem, Order, Product } from '../data/mockData';
import { clearAuthToken, getAuthToken, loginApi, logoutApi, meApi, registerApi, setAuthToken, type ApiUser } from '../services/authApi';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  phone: string;
  points: number;
  isAdmin: boolean;
  joinDate: string;
}

interface AppState {
  user: User | null;
  cart: CartItem[];
  orders: Order[];
  isAuthenticated: boolean;
  wishlist: string[];
}

interface PlaceOrderInput {
  address: string;
  paymentMethod: string;
  shipping: number;
  discount: number;
}

type AppAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER_POINTS'; payload: number }
  | { type: 'PLACE_ORDER'; payload: Order }
  | { type: 'ADD_TO_CART'; payload: { product: Product; quantity: number; customization?: CartItem['customization'] } }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_WISHLIST'; payload: string };

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  login: (email: string, password: string) => Promise<User | null>;
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<User | null>;
  logout: () => void;
  addToCart: (product: Product, quantity?: number, customization?: CartItem['customization']) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  placeOrder: (input: PlaceOrderInput) => Order | null;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

function mapApiUserToAppUser(user: ApiUser): User {
  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    avatar: `https://i.pravatar.cc/120?u=${encodeURIComponent(user.email)}`,
    phone: '',
    points: user.points ?? 0,
    isAdmin: user.role === 'admin',
    joinDate: user.joinedAt ?? new Date().toISOString().slice(0, 10),
  };
}

// ─── Reducer ───────────────────────────────────────────────────────────────────
function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload, isAuthenticated: true };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false, cart: [] };
    case 'UPDATE_USER_POINTS':
      if (!state.user) {
        return state;
      }

      return {
        ...state,
        user: {
          ...state.user,
          points: action.payload,
        },
      };
    case 'PLACE_ORDER':
      return { ...state, orders: [action.payload, ...state.orders] };
    case 'ADD_TO_CART': {
      const exists = state.cart.find(i => i.product.id === action.payload.product.id);
      if (exists) {
        return {
          ...state,
          cart: state.cart.map(i =>
            i.product.id === action.payload.product.id
              ? { ...i, quantity: i.quantity + action.payload.quantity }
              : i
          ),
        };
      }
      return { ...state, cart: [...state.cart, { product: action.payload.product, quantity: action.payload.quantity, customization: action.payload.customization }] };
    }
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter(i => i.product.id !== action.payload) };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        cart: action.payload.quantity === 0
          ? state.cart.filter(i => i.product.id !== action.payload.productId)
          : state.cart.map(i => i.product.id === action.payload.productId ? { ...i, quantity: action.payload.quantity } : i),
      };
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    case 'TOGGLE_WISHLIST':
      return {
        ...state,
        wishlist: state.wishlist.includes(action.payload)
          ? state.wishlist.filter(id => id !== action.payload)
          : [...state.wishlist, action.payload],
      };
    default:
      return state;
  }
}

// ─── Context ───────────────────────────────────────────────────────────────────
const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = 'smash_commerce_state';
const DEFAULT_STATE: AppState = { user: null, cart: [], orders: [], isAuthenticated: false, wishlist: [] };

function createInitialState(stored: string | null): AppState {
  if (!stored) {
    return DEFAULT_STATE;
  }

  try {
    const parsed = JSON.parse(stored) as Partial<AppState>;

    return {
      ...DEFAULT_STATE,
      ...parsed,
      cart: Array.isArray(parsed.cart) ? parsed.cart : [],
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      wishlist: Array.isArray(parsed.wishlist) ? parsed.wishlist : [],
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const stored = localStorage.getItem(STORAGE_KEY);
  const initialState = createInitialState(stored);

  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const token = getAuthToken();

    if (!token) {
      if (state.isAuthenticated) {
        dispatch({ type: 'LOGOUT' });
      }
      return;
    }

    let isMounted = true;

    const syncUser = async () => {
      try {
        const response = await meApi(token);
        if (isMounted) {
          dispatch({ type: 'LOGIN', payload: mapApiUserToAppUser(response.data) });
        }
      } catch {
        clearAuthToken();
        if (isMounted) {
          dispatch({ type: 'LOGOUT' });
        }
      }
    };

    if (!state.isAuthenticated) {
      void syncUser();
    }

    return () => {
      isMounted = false;
    };
  }, [state.isAuthenticated]);

  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      const response = await loginApi({ email, password });
      setAuthToken(response.token);
      const userData = mapApiUserToAppUser(response.data);
      dispatch({ type: 'LOGIN', payload: userData });
      return userData;
    } catch {
      return null;
    }
  };

  const register = async (name: string, email: string, password: string, passwordConfirmation: string): Promise<User | null> => {
    try {
      const response = await registerApi({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      setAuthToken(response.token);
      const userData = mapApiUserToAppUser(response.data);
      dispatch({ type: 'LOGIN', payload: userData });
      return userData;
    } catch {
      return null;
    }
  };

  const logout = () => {
    const token = getAuthToken();

    if (token) {
      void logoutApi(token);
    }

    clearAuthToken();
    dispatch({ type: 'LOGOUT' });
  };
  const addToCart = (product: Product, quantity = 1, customization?: CartItem['customization']) =>
    dispatch({ type: 'ADD_TO_CART', payload: { product, quantity, customization } });
  const removeFromCart = (productId: string) => dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  const updateQuantity = (productId: string, quantity: number) => dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  const placeOrder = (input: PlaceOrderInput): Order | null => {
    if (state.cart.length === 0) {
      return null;
    }

    const subtotal = state.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const total = Math.max(subtotal + input.shipping - input.discount, 0);
    const now = new Date();

    const order: Order = {
      id: `ORD-${now.getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
      date: now.toISOString().slice(0, 10),
      status: 'processing',
      items: state.cart.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        price: item.product.price,
      })),
      subtotal,
      shipping: input.shipping,
      total,
      address: input.address,
      paymentMethod: input.paymentMethod,
      trackingNumber: `SMASH${Math.floor(Math.random() * 9000000) + 1000000}`,
    };

    dispatch({ type: 'PLACE_ORDER', payload: order });
    dispatch({ type: 'CLEAR_CART' });

    return order;
  };
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  const cartTotal = state.cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const cartCount = state.cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <AppContext.Provider value={{ state, dispatch, login, register, logout, addToCart, removeFromCart, updateQuantity, placeOrder, clearCart, cartTotal, cartCount }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}