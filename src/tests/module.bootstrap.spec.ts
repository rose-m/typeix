import {assert, use} from "chai";
import * as sinonChai from "sinon-chai";
import {Module} from "../decorators/module";
import {Injectable} from "../decorators/injectable";
import {BOOTSTRAP_MODULE, createModule, getModule} from "../server/bootstrap";
import {IModule} from "../interfaces/imodule";
import {Inject} from "../decorators/inject";

// use chai spies
use(sinonChai);

describe("Modules", () => {

  @Injectable()
  class ServiceA {}

  @Injectable()
  class ServiceB {}

  @Injectable()
  class ServiceC {}


  @Injectable()
  class ServiceC1 {

  }

  @Injectable()
  class ServiceB1 {

    @Inject(ServiceC1)
    service: ServiceC1;

  }

  @Injectable()
  class ServiceA1 {

    @Inject(ServiceB1)
    service: ServiceB1;

  }



  it("ModuleA initialized", () => {

    @Module({
      name: BOOTSTRAP_MODULE,
      providers: [ServiceA]
    })
    class ModuleA {

    }

    let _modules: Array<IModule> = createModule(ModuleA);
    let iModule = getModule(_modules, BOOTSTRAP_MODULE);
    assert.isDefined(iModule);
  });


  it("ModuleA service check", () => {

    @Module({
      name: BOOTSTRAP_MODULE,
      providers: [ServiceA]
    })
    class ModuleA {

    }

    let _modules: Array<IModule> = createModule(ModuleA);
    let iModule = getModule(_modules, BOOTSTRAP_MODULE);
    assert.isDefined(iModule.injector.get(ModuleA));
  });


  it("Module B import test", () => {
    let name = "moduleb";
    @Module({
      name: name,
      providers: [ServiceB]
    })
    class ModuleB {}


    @Module({
      imports: [ModuleB],
      name: BOOTSTRAP_MODULE,
      providers: [ServiceA]
    })
    class ModuleA {

    }

    let _modules: Array<IModule> = createModule(ModuleA);

    let iModuleB = getModule(_modules, name);
    assert.isDefined(iModuleB.injector.get(ServiceB));
    assert.isDefined(iModuleB);

    let iModuleA = getModule(_modules, BOOTSTRAP_MODULE);
    assert.isDefined(iModuleA.injector.get(ServiceA));
    assert.isDefined(iModuleA);
  });


  it("Module B exports test", () => {
    let name = "moduleb";
    @Module({
      exports: [ServiceB],
      name: name,
      providers: [ServiceB]
    })
    class ModuleB {}


    @Module({
      imports: [ModuleB],
      name: BOOTSTRAP_MODULE,
      providers: [ServiceA]
    })
    class ModuleA {

    }

    let _modules: Array<IModule> = createModule(ModuleA);

    let iModuleB = getModule(_modules, name);
    assert.isDefined(iModuleB.injector.get(ServiceB));
    assert.isDefined(iModuleB);

    let iModuleA = getModule(_modules, BOOTSTRAP_MODULE);
    assert.isDefined(iModuleA.injector.get(ServiceA));
    assert.isDefined(iModuleA.injector.get(ServiceB));
    assert.isDefined(iModuleA);
  });


  it("Module C nested imports test with ServiceB export", () => {
    let name = "moduleb";
    let name2 = "modulec";

    @Module({
      exports: [ServiceC],
      name: name2,
      providers: [ServiceC]
    })
    class ModuleC {}


    @Module({
      exports: [ServiceB],
      imports: [ModuleC],
      name: name,
      providers: [ServiceB]
    })
    class ModuleB {}


    @Module({
      imports: [ModuleB],
      name: BOOTSTRAP_MODULE,
      providers: [ServiceA]
    })
    class ModuleA {

    }

    let _modules: Array<IModule> = createModule(ModuleA);

    let iModuleC = getModule(_modules, name2);
    assert.isDefined(iModuleC);
    assert.isDefined(iModuleC.injector.get(ServiceC));


    let iModuleB = getModule(_modules, name);
    assert.isDefined(iModuleB);
    assert.isDefined(iModuleB.injector.get(ServiceB));


    let iModuleA = getModule(_modules, BOOTSTRAP_MODULE);
    assert.isDefined(iModuleA);
    assert.isDefined(iModuleA.injector.get(ServiceA));
    assert.isDefined(iModuleA.injector.get(ServiceB));

    assert.equal(iModuleA.injector.get(ServiceB), iModuleB.injector.get(ServiceB));

    assert.throws(() => {
      iModuleA.injector.get(ServiceC);
    }, "No provider for ServiceC, injector: " + iModuleA.injector.getId());

    assert.throws(() => {
      iModuleC.injector.get(ServiceB);
    }, "No provider for ServiceB, injector: " + iModuleC.injector.getId());
  });

  it("Module C nested imports test has own ServiceB instance", () => {
    let name = "moduleb";
    let name2 = "modulec";

    @Module({
      exports: [ServiceC1],
      name: name2,
      providers: [ServiceC1, ServiceB1]
    })
    class ModuleC1 {}

    @Module({
      exports: [ServiceB1],
      imports: [ModuleC1],
      name: name,
      providers: [ServiceB1]
    })
    class ModuleB1 {}

    @Module({
      imports: [ModuleB1],
      name: BOOTSTRAP_MODULE,
      providers: [ServiceA1]
    })
    class ModuleA1 {}

    let _modules: Array<IModule> = createModule(ModuleA1);

    let iModuleC = getModule(_modules, name2);
    assert.isDefined(iModuleC);
    assert.isDefined(iModuleC.injector.get(ServiceC1));
    assert.isDefined(iModuleC.injector.get(ServiceB1));


    let iModuleB = getModule(_modules, name);
    assert.isDefined(iModuleB);
    assert.isDefined(iModuleB.injector.get(ServiceB1));
    assert.notEqual(iModuleC.injector.get(ServiceB1), iModuleB.injector.get(ServiceB1));

    let iModuleA = getModule(_modules, BOOTSTRAP_MODULE);
    assert.isDefined(iModuleA);
    assert.isDefined(iModuleA.injector.get(ServiceA1));
    assert.isDefined(iModuleA.injector.get(ServiceB1));
  });


  it("Module C nested imports, chain exports are not allowed and thy have to be imported", () => {
    let name = "moduleb";
    let name2 = "modulec";

    @Module({
      exports: [ServiceC1],
      name: name2,
      providers: [ServiceC1, ServiceB1]
    })
    class ModuleC {}


    @Module({
      exports: [ServiceB1],
      imports: [ModuleC],
      name: name,
      providers: [ServiceB1]
    })
    class ModuleB {}


    @Module({
      imports: [ModuleB, ModuleC],
      name: BOOTSTRAP_MODULE,
      providers: [ServiceA1]
    })
    class ModuleA {

    }

    let _modules: Array<IModule> = createModule(ModuleA);
    let iModuleA = getModule(_modules, BOOTSTRAP_MODULE);
    let iModuleB = getModule(_modules, name);
    let iModuleC = getModule(_modules, name2);
    assert.isDefined(iModuleA);
    assert.isDefined(iModuleA.injector.get(ServiceA1));
    assert.isDefined(iModuleA.injector.get(ServiceB1));
    assert.isDefined(iModuleA.injector.get(ServiceC1));
    assert.equal(iModuleA.injector.get(ServiceC1), iModuleC.injector.get(ServiceC1));
    assert.equal(iModuleB.injector.get(ServiceC1), iModuleC.injector.get(ServiceC1));
    assert.equal(iModuleA.injector.get(ServiceB1), iModuleB.injector.get(ServiceB1));
    assert.notEqual(iModuleA.injector.get(ServiceB1), iModuleC.injector.get(ServiceB1));
    assert.notEqual(iModuleB.injector.get(ServiceB1), iModuleC.injector.get(ServiceB1));
  });


});