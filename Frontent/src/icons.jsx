import * as Icons from 'lucide-react'

const EXCEPTIONS = {
  'user-cog': 'UserCog',
  'shield-check': 'ShieldCheck',
  'check-check': 'CheckCheck',
  'alert-triangle': 'AlertTriangle',
  'plus-circle': 'PlusCircle',
  'key-round': 'KeyRound',
  'flask-conical': 'FlaskConical',
  'flask-round': 'FlaskRound',
  'bar-chart-3': 'BarChart3',
  'arrow-up-right': 'ArrowUpRight',
  'arrow-right': 'ArrowRight',
  'arrow-down': 'ArrowDown',
  'radio-tower': 'RadioTower',
  'map-pin': 'MapPin',
  'phone-call': 'PhoneCall',
  'bell-ring': 'BellRing',
  'layout-dashboard': 'LayoutDashboard',
  'clipboard-list': 'ClipboardList',
  'trending-up': 'TrendingUp',
  'log-in': 'LogIn',
  'log-out': 'LogOut',
  'user-plus': 'UserPlus',
  'file-text': 'FileText',
  'file-check': 'FileCheck',
  'panel-left-close': 'PanelLeftClose',
  'panel-left-open': 'PanelLeftOpen',
  'building-2': 'Building2',
  'message-circle': 'MessageCircle',
  'refresh-cw': 'RefreshCw',
  'shield-alert': 'ShieldAlert',
  'shield': 'Shield'
}

function toPascal(name) {
  if (EXCEPTIONS[name]) return EXCEPTIONS[name]
  return name.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('')
}

export default function Icon({ name, className, size, strokeWidth, ...rest }) {
  const Comp = Icons[toPascal(name)] || Icons.Circle
  return <Comp className={className} size={size} strokeWidth={strokeWidth} {...rest} />
}