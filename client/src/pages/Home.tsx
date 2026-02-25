import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, BarChart3, Shield, Users, FileText, Zap, Clock, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">PH</span>
            </div>
            <span className="font-bold text-lg text-slate-900">PayrollHub</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-600 hover:text-slate-900 transition">Fonctionnalités</a>
            <a href="#benefits" className="text-sm text-slate-600 hover:text-slate-900 transition">Avantages</a>
            <a href="#compliance" className="text-sm text-slate-600 hover:text-slate-900 transition">Conformité</a>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              Démarrer
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              ✨ Conforme aux Réglementations 2025-2026
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight">
              Gestion Intégrée de <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Paie et RH</span> en Tunisie
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              Une plateforme complète pour simplifier la gestion de la paie, des congés et des ressources humaines. Conforme à toutes les réglementations tunisiennes : CNSS, IRPP, SMIG 2025-2026.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                Demander une Démo
              </Button>
              <Button size="lg" variant="outline" className="border-slate-300 text-slate-700">
                En Savoir Plus
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-2xl blur-3xl opacity-20"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-slate-100">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle2 className="text-green-600 flex-shrink-0" size={20} />
                  <span className="text-sm text-green-800">Calcul automatique CNSS 9,68% / 17,07%</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <CheckCircle2 className="text-blue-600 flex-shrink-0" size={20} />
                  <span className="text-sm text-blue-800">IRPP 2025 avec 7 tranches progressives</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <CheckCircle2 className="text-purple-600 flex-shrink-0" size={20} />
                  <span className="text-sm text-purple-800">Déclarations D-17 et DGI automatisées</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <CheckCircle2 className="text-orange-600 flex-shrink-0" size={20} />
                  <span className="text-sm text-orange-800">Portail libre-service employé intégré</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Fonctionnalités Principales</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Une suite complète d'outils pour gérer tous les aspects de la paie et des RH
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="text-blue-600" size={24} />
                </div>
                <CardTitle>Calcul Automatisé de Paie</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-600">
                Moteur de calcul intelligent appliquant automatiquement les règles tunisiennes : SMIG, CNSS, IRPP, FOPROLOS, TFP. Zéro erreur manuelle.
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="text-green-600" size={24} />
                </div>
                <CardTitle>Déclarations Réglementaires</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-600">
                Génération automatique des déclarations CNSS D-17, DGI, bulletins de paie officiels et attestations CNSS. Conformité garantie.
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center mb-4">
                  <Users className="text-purple-600" size={24} />
                </div>
                <CardTitle>Portail Employé</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-600">
                Accès sécurisé aux bulletins de paie, soldes de congés, demandes de congés et documents officiels. Réduction de la charge RH.
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="text-orange-600" size={24} />
                </div>
                <CardTitle>Gestion des Congés</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-600">
                Suivi automatique des congés payés, maternité, paternité et maladie. Calcul des soldes et workflow d'approbation intégré.
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="text-red-600" size={24} />
                </div>
                <CardTitle>Sécurité et Conformité</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-600">
                Authentification sécurisée, contrôle d'accès basé sur les rôles (RBAC), chiffrement des données sensibles et audit complet.
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="text-indigo-600" size={24} />
                </div>
                <CardTitle>Rapports et Analyses</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-600">
                Tableaux de bord personnalisés, rapports de masse salariale, analyses d'absentéisme et prévisions financières.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Avantages pour Votre Entreprise</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Optimisez vos opérations RH et réduisez les coûts administratifs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={20} />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Gain de Temps</h3>
                  <p className="text-slate-300">Automatisation complète des calculs de paie, réduction de 80% du temps administratif.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={20} />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Zéro Erreur</h3>
                  <p className="text-slate-300">Moteur de calcul conforme aux réglementations tunisiennes, élimination des erreurs manuelles.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={20} />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Conformité Garantie</h3>
                  <p className="text-slate-300">Mise à jour automatique des barèmes SMIG, CNSS et IRPP. Déclarations réglementaires générées automatiquement.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={20} />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Satisfaction Employés</h3>
                  <p className="text-slate-300">Accès 24/7 aux bulletins de paie et documents officiels. Demandes de congés simplifiées.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={20} />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Réduction des Coûts</h3>
                  <p className="text-slate-300">Diminution des frais administratifs et des risques de pénalités pour non-conformité.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={20} />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Scalabilité</h3>
                  <p className="text-slate-300">Solution adaptée aux PME comme aux grandes entreprises. Croissance sans limite.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={20} />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Sécurité des Données</h3>
                  <p className="text-slate-300">Chiffrement des données sensibles, conformité RGPD et audit complet des accès.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={20} />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Support Continu</h3>
                  <p className="text-slate-300">Mise à jour régulière des réglementations, support technique 24/7 et formation utilisateurs.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Section */}
      <section id="compliance" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Conformité Réglementaire 2025-2026</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Entièrement conforme aux dernières réglementations tunisiennes
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">SMIG Actualisé</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-700">48h/semaine</span>
                  <span className="font-bold text-slate-900">528,320 TND</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-700">40h/semaine</span>
                  <span className="font-bold text-slate-900">448,238 TND</span>
                </div>
                <p className="text-sm text-slate-600 pt-2">Mis à jour au 1er janvier 2025</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">Cotisations CNSS 2025</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-700">Part Salariale</span>
                  <span className="font-bold text-slate-900">9,68%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-700">Part Patronale</span>
                  <span className="font-bold text-slate-900">17,07%</span>
                </div>
                <p className="text-sm text-slate-600 pt-2">Augmentation de 0,5% appliquée</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">IRPP 2025 (7 Tranches)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between p-2 bg-slate-50 rounded">
                  <span>0 - 5 000 TND</span>
                  <span className="font-bold">0%</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-50 rounded">
                  <span>5 001 - 10 000 TND</span>
                  <span className="font-bold">15,5%</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-50 rounded">
                  <span>10 001 - 20 000 TND</span>
                  <span className="font-bold">25,5%</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-50 rounded">
                  <span>20 001 - 30 000 TND</span>
                  <span className="font-bold">30,5%</span>
                </div>
                <div className="text-slate-600 text-xs pt-2">+ 4 tranches supplémentaires jusqu'à 40,5%</div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">Autres Contributions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-700">FOPROLOS</span>
                  <span className="font-bold text-slate-900">1%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-700">TFP (Industrie)</span>
                  <span className="font-bold text-slate-900">2%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-700">TFP (Services)</span>
                  <span className="font-bold text-slate-900">1%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Prêt à Transformer Votre Gestion RH ?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Rejoignez les entreprises tunisiennes qui font confiance à PayrollHub pour leur paie et leurs ressources humaines.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-bold">
              Demander une Démo Gratuite
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-blue-700">
              Contacter Notre Équipe
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">PH</span>
                </div>
                <span className="font-bold text-white">PayrollHub</span>
              </div>
              <p className="text-sm">Gestion intégrée de paie et RH pour les entreprises tunisiennes.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Produit</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-white transition">Tarification</a></li>
                <li><a href="#" className="hover:text-white transition">Sécurité</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Entreprise</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">À Propos</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Carrières</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Légal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Confidentialité</a></li>
                <li><a href="#" className="hover:text-white transition">Conditions</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8">
            <p className="text-center text-sm">© 2025 PayrollHub Tunisia. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
