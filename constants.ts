import { Exercise, WeekDay } from './types';

export const WEEK_DAYS: WeekDay[] = [
  { id: 'lun', label: 'LUN', full: 'Lunedì', focus: 'Full Push' },
  { id: 'mar', label: 'MAR', full: 'Martedì', focus: 'Full Pull' },
  { id: 'mer', label: 'MER', full: 'Mercoledì', focus: 'Rest' },
  { id: 'gio', label: 'GIO', full: 'Giovedì', focus: 'Upper Push' },
  { id: 'ven', label: 'VEN', full: 'Venerdì', focus: 'Upper Pull' },
  { id: 'sab', label: 'SAB', full: 'Sabato', focus: 'Legs' },
  { id: 'dom', label: 'DOM', full: 'Domenica', focus: 'Rest' },
];

export const EXERCISE_DB: Exercise[] = [
  // LUNEDÌ
  { id: 'lun_1', day: 'lun', name: 'Spinte con manubri (Panca 30°)', muscle: 'Petto Alto', function: 'Spinta inclinata' },
  { id: 'lun_2', day: 'lun', name: 'Pec Deck', muscle: 'Petto Isolamento', function: 'Adduzione orizzontale' },
  { id: 'lun_3', day: 'lun', name: 'Lento avanti con manubri', muscle: 'Spalle', function: 'Spinta verticale' },
  { id: 'lun_4', day: 'lun', name: 'Alzate laterali ai cavi', muscle: 'Spalle Lat.', function: 'Abduzione' },
  { id: 'lun_8', day: 'lun', name: 'Hack Squat (Quad Focus)', muscle: 'Quadricipiti', function: 'Accosciata' },
  { id: 'lun_5', day: 'lun', name: 'Leg Extension', muscle: 'Quadricipiti', function: 'Estensione ginocchio' },
  { id: 'lun_6', day: 'lun', name: 'Calf Press a gamba estesa', muscle: 'Polpacci', function: 'Flessione plantare' },
  { id: 'lun_7', day: 'lun', name: 'Pushdown Tricipiti (Cavo alto)', muscle: 'Tricipiti', function: 'Estensione gomito' },
  // MARTEDÌ
  { id: 'mar_1', day: 'mar', name: 'RDL (Stacchi Rumeni) manubri', muscle: 'Femorali/Glutei', function: 'Estensione anca' },
  { id: 'mar_2', day: 'mar', name: 'T-Bar Row', muscle: 'Upper Back', function: 'Retrazione scapolare' },
  { id: 'mar_3', day: 'mar', name: 'Lat Machine presa neutra', muscle: 'Schiena Ampiezza', function: 'Estensione spalla' },
  { id: 'mar_4', day: 'mar', name: 'Leg Curl Seduto', muscle: 'Femorali', function: 'Flessione ginocchio' },
  { id: 'mar_5', day: 'mar', name: 'Preacher Curl (Panca Scott)', muscle: 'Bicipiti', function: 'Flessione gomito' },
  { id: 'mar_6', day: 'mar', name: 'Rope Hammer Curl', muscle: 'Bicipiti/Brachiale', function: 'Flessione gomito neutra' },
  { id: 'mar_7', day: 'mar', name: 'Crunch al cavo alto', muscle: 'Addome', function: 'Flessione tronco' },
  // GIOVEDÌ
  { id: 'gio_8', day: 'gio', name: 'Panca 30° al Multipower', muscle: 'Petto Alto', function: 'Spinta inclinata' },
  { id: 'gio_1', day: 'gio', name: 'Croci al cavo alto', muscle: 'Petto', function: 'Adduzione orizzontale' },
  { id: 'gio_2', day: 'gio', name: 'Chest Press', muscle: 'Petto', function: 'Spinta orizzontale' },
  { id: 'gio_3', day: 'gio', name: 'Shoulder Press Machine', muscle: 'Spalle', function: 'Spinta verticale' },
  { id: 'gio_4', day: 'gio', name: 'Alzate laterali con manubri', muscle: 'Spalle Lat.', function: 'Abduzione' },
  { id: 'gio_5', day: 'gio', name: 'Overhead Extension cavi', muscle: 'Tricipiti', function: 'Estensione gomito' },
  { id: 'gio_6', day: 'gio', name: 'Pushdown ai cavi', muscle: 'Tricipiti', function: 'Estensione gomito' },
  // VENERDÌ
  { id: 'ven_1', day: 'ven', name: 'T-Bar Row (Focus Trapezi)', muscle: 'Upper Back', function: 'Retrazione scapolare' },
  { id: 'ven_2', day: 'ven', name: 'Lat Machine (Presa larga)', muscle: 'Schiena Ampiezza', function: 'Adduzione omero' },
  { id: 'ven_3', day: 'ven', name: 'Rematore manubri Panca 45°', muscle: 'Dorsali', function: 'Estensione spalla' },
  { id: 'ven_4', day: 'ven', name: 'Reverse Pec Deck', muscle: 'Deltoidi Post.', function: 'Abduzione orizzontale' },
  { id: 'ven_5', day: 'ven', name: 'Curl alternato con manubri', muscle: 'Bicipiti', function: 'Flessione gomito' },
  { id: 'ven_6', day: 'ven', name: 'Reverse Curl ai cavi', muscle: 'Avambracci', function: 'Flessione gomito prona' },
  { id: 'ven_7', day: 'ven', name: 'Wrist Curl con manubri', muscle: 'Flessori Polso', function: 'Flessione polso' },
  // SABATO
  { id: 'sab_1', day: 'sab', name: 'Back Squat', muscle: 'Quadricipiti', function: 'Accosciata' },
  { id: 'sab_2', day: 'sab', name: 'Leg Extension', muscle: 'Quadricipiti', function: 'Estensione ginocchio' },
  { id: 'sab_3', day: 'sab', name: 'Leg Curl seduto', muscle: 'Femorali', function: 'Flessione ginocchio' },
  { id: 'sab_4', day: 'sab', name: 'Hyperextension', muscle: 'Glutei', function: 'Estensione anca' },
  { id: 'sab_5', day: 'sab', name: 'Adductor Machine', muscle: 'Interno Coscia', function: 'Adduzione anca' },
  { id: 'sab_6', day: 'sab', name: 'Calf Raise a gamba tesa', muscle: 'Polpacci', function: 'Flessione plantare' },
  { id: 'sab_7', day: 'sab', name: 'Hanging Leg Raises', muscle: 'Addome Basso', function: 'Flessione anca' },
  { id: 'sab_8', day: 'sab', name: 'Crunch su panca declinata', muscle: 'Addome', function: 'Flessione tronco' },
];