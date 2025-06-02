'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">frontend-web-emotions documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-AppModule-0f89aaeae54b98390099913d29e38c48908e04bda7d683ce03fc1269b7ae0358a0521388163235d4832f65620b4a70413e938bc02f36094fe9f7aa8cae167b15"' : 'data-bs-target="#xs-components-links-module-AppModule-0f89aaeae54b98390099913d29e38c48908e04bda7d683ce03fc1269b7ae0358a0521388163235d4832f65620b4a70413e938bc02f36094fe9f7aa8cae167b15"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AppModule-0f89aaeae54b98390099913d29e38c48908e04bda7d683ce03fc1269b7ae0358a0521388163235d4832f65620b4a70413e938bc02f36094fe9f7aa8cae167b15"' :
                                            'id="xs-components-links-module-AppModule-0f89aaeae54b98390099913d29e38c48908e04bda7d683ce03fc1269b7ae0358a0521388163235d4832f65620b4a70413e938bc02f36094fe9f7aa8cae167b15"' }>
                                            <li class="link">
                                                <a href="components/AccessDeniedComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AccessDeniedComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AnalysisComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AnalysisComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AppComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AudioComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AudioComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AudioEmotionsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AudioEmotionsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AudioVadLiveComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AudioVadLiveComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AuthenticationComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthenticationComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CategoricComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CategoricComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ConfigComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ConfigComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CsvAudiosComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CsvAudiosComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CustomCardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CustomCardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DeferredInferenceComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DeferredInferenceComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DimensionalComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DimensionalComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/GraphicRepresentationComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GraphicRepresentationComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/IndividualComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >IndividualComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/IndividualFormComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >IndividualFormComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LayoutHeaderComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LayoutHeaderComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LayoutMainComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LayoutMainComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LoginComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LoginComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PrincipalComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PrincipalComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/RegisterFormComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RegisterFormComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ShiftFormComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ShiftFormComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ShiftRepresentationComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ShiftRepresentationComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppRoutingModule.html" data-type="entity-link" >AppRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/AppServerModule.html" data-type="entity-link" >AppServerModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-AppServerModule-dc9648098426afe1ad5a086cc9a46fb7b60c9137f90f1d4f4482d5b14a7568ef3b5e5e6fc569a3881f6aecde5519c4a0a16ee7e1aa42139c9cfc3d48d3fcb7ea"' : 'data-bs-target="#xs-components-links-module-AppServerModule-dc9648098426afe1ad5a086cc9a46fb7b60c9137f90f1d4f4482d5b14a7568ef3b5e5e6fc569a3881f6aecde5519c4a0a16ee7e1aa42139c9cfc3d48d3fcb7ea"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AppServerModule-dc9648098426afe1ad5a086cc9a46fb7b60c9137f90f1d4f4482d5b14a7568ef3b5e5e6fc569a3881f6aecde5519c4a0a16ee7e1aa42139c9cfc3d48d3fcb7ea"' :
                                            'id="xs-components-links-module-AppServerModule-dc9648098426afe1ad5a086cc9a46fb7b60c9137f90f1d4f4482d5b14a7568ef3b5e5e6fc569a3881f6aecde5519c4a0a16ee7e1aa42139c9cfc3d48d3fcb7ea"' }>
                                            <li class="link">
                                                <a href="components/AppComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/SharedModule.html" data-type="entity-link" >SharedModule</a>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/Alignment.html" data-type="entity-link" >Alignment</a>
                            </li>
                            <li class="link">
                                <a href="classes/AudioUtils.html" data-type="entity-link" >AudioUtils</a>
                            </li>
                            <li class="link">
                                <a href="classes/Classification.html" data-type="entity-link" >Classification</a>
                            </li>
                            <li class="link">
                                <a href="classes/Config.html" data-type="entity-link" >Config</a>
                            </li>
                            <li class="link">
                                <a href="classes/CsvGestor.html" data-type="entity-link" >CsvGestor</a>
                            </li>
                            <li class="link">
                                <a href="classes/DateHelper.html" data-type="entity-link" >DateHelper</a>
                            </li>
                            <li class="link">
                                <a href="classes/Employee.html" data-type="entity-link" >Employee</a>
                            </li>
                            <li class="link">
                                <a href="classes/Record.html" data-type="entity-link" >Record</a>
                            </li>
                            <li class="link">
                                <a href="classes/RecordingEmotions.html" data-type="entity-link" >RecordingEmotions</a>
                            </li>
                            <li class="link">
                                <a href="classes/VAD.html" data-type="entity-link" >VAD</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AnalysisService.html" data-type="entity-link" >AnalysisService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ApiConfigService.html" data-type="entity-link" >ApiConfigService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AudioService.html" data-type="entity-link" >AudioService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthService.html" data-type="entity-link" >AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ChartDataService.html" data-type="entity-link" >ChartDataService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ConfigService.html" data-type="entity-link" >ConfigService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/EmotionTranslationService.html" data-type="entity-link" >EmotionTranslationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/EmployeeService.html" data-type="entity-link" >EmployeeService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ForceAlignmentService.html" data-type="entity-link" >ForceAlignmentService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/IndividualService.html" data-type="entity-link" >IndividualService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ShiftService.html" data-type="entity-link" >ShiftService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/ChartData.html" data-type="entity-link" >ChartData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FullConfig.html" data-type="entity-link" >FullConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/User.html" data-type="entity-link" >User</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VADOptions.html" data-type="entity-link" >VADOptions</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});