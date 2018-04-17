<?php

namespace Octave\CMSBundle\Page\Block;

use Symfony\Component\Form\Extension\Core\Type\TextType;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class LineInputBlock extends AbstractBlock
{
    const NAME = 'line_input';
    const LABEL = 'Line input';

    /** @var string */
    private $template;

    /**
     * EditorBlock constructor.
     * @param string $template
     */
    public function __construct($template)
    {
        $this->template = $template;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return self::NAME;
    }

    /**
     * @return string
     */
    public function getLabel()
    {
        return self::LABEL;
    }

    /**
     * @return string
     */
    public function getIcon()
    {
        return 'fa fa-file-o';
    }

    /**
     * @return string
     */
    public function getFormType()
    {
        return TextType::class;
    }

    /**
     * @return string
     */
    public function getContentTemplate()
    {
        return $this->template;
    }
}