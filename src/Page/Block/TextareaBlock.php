<?php

namespace VideInfra\CMSBundle\Page\Block;

use Symfony\Component\Form\Extension\Core\Type\TextareaType;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class TextareaBlock extends AbstractBlock
{
    /**
     * @return string
     */
    public function getName()
    {
        return 'textarea';
    }

    /**
     * @return string
     */
    public function getLabel()
    {
        return 'Text';
    }

    /**
     * @return string
     */
    public function getIcon()
    {
        return 'fa fa-file-text-o';
    }

    /**
     * @return string
     */
    public function getFormType()
    {
        return TextareaType::class;
    }
}