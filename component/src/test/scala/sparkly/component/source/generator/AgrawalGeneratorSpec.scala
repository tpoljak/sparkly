package sparkly.component.source.generator

import sparkly.testing._
import sparkly.core._

class AgrawalGeneratorSpec extends ComponentSpec {

  "Agrawal generator" should "generate random loan" in {

    val configuration = ComponentConfiguration (
      clazz = classOf[AgrawalGenerator].getName,
      name = "Source",
      outputs = Map (
        "Instances" -> StreamConfiguration(mappedFeatures = Map (
          "salary" -> "salary",
          "commission" -> "commission",
          "age" -> "age",
          "elevel" ->  "elevel",
          "car" -> "car",
          "zipcode" -> "zipcode",
          "hvalue" -> "hvalue",
          "hyears" -> "hyears",
          "loan" -> "loan",
          "class" -> "class"
        ))
      )
    )

    val component = deployComponent(configuration)

    eventually {
      component.outputs("Instances").instances.foreach { instance =>
        instance.outputFeature("salary").as[Double] should be > 0.0
        instance.outputFeature("commission").as[Double] should be >= 0.0
        instance.outputFeature("age").as[Int] should be > 0
        instance.outputFeature("elevel").as[String] should startWith("level")
        instance.outputFeature("car").as[String] should startWith("car")
        instance.outputFeature("zipcode").as[String] should startWith("zipcode")
        instance.outputFeature("hvalue").as[Double] should be > 0.0
        instance.outputFeature("hyears").as[Int] should be > 0
        instance.outputFeature("loan").as[Double] should be >= 0.0
        instance.outputFeature("class").as[String] should startWith("group")
      }

      // Check it generates random instances
      component.outputs("Instances").instances.toSet.size should be > 1
    }
  }

}