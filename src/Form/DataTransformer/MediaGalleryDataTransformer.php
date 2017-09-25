<?php

namespace VideInfra\CMSBundle\Form\DataTransformer;

use Symfony\Component\Form\DataTransformerInterface;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class MediaGalleryDataTransformer implements DataTransformerInterface
{
    /**
     * @param mixed $value
     * @return mixed
     */
    public function transform($value)
    {
        if (!is_string($value)) {
            $output = $value;
        }
        else {
            $output = json_decode($value, true);
        }

        if (!empty($output)) {
            uasort($output, function ($a, $b) {
                return $a['galleryorder'] <= $b['galleryorder'] ? -1 : 1;
            });
        }

        return $output;
    }

    /**
     * @param mixed $value
     * @return mixed|string
     */
    public function reverseTransform($value)
    {
        if (is_string($value)) {
            return $value;
        }

        return json_encode($value);
    }
}