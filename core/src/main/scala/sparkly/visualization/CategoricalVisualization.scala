package sparkly.visualization

import sparkly.core._
import sparkly.core.PropertyType._
import org.apache.spark.streaming.Milliseconds
import org.apache.spark.streaming.StreamingContext._

class CategoricalVisualization extends Visualization {

  implicit def orderingByName: Ordering[(String, Double)] = Ordering.by(count => count._2)

  def metadata = VisualizationMetadata (
    name = "Categorical distribution",
    properties = Map("Window length (in ms)" -> PropertyMetadata(LONG), "Max category (0 for unlimited)" -> PropertyMetadata(INTEGER, Some(0))),
    features = List("Categorical feature (String, Boolean)")
  )

  override def init(context: VisualizationContext): Unit = {
    val dstream = context.features("Categorical feature (String, Boolean)")
    val windowDuration = Milliseconds(context.properties("Window length (in ms)").as[Long])
    val max = context.properties("Max category (0 for unlimited)").as[Int]
    val dataCollector = context.dataCollector

    dstream
      .map{f => (f.or("$MISSING_FEATURE$"), 1.0)}
      .reduceByKeyAndWindow(_ + _, windowDuration)
      .foreachRDD((rdd, time) => {
        val total = if(rdd.count() > 0) rdd.map(_._2).reduce(_ + _) else 0.0
        val counts = if(max > 0) {
          rdd.top(max).toMap
        } else {
          rdd.collect().toMap
        }

        val data = counts ++ Map("$TOTAL$" -> total)
        dataCollector.push(time.milliseconds, data)
      })
  }
}